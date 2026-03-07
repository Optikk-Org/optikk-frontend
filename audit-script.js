import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const srcDir = path.join(projectRoot, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function analyzeFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  if (filePath.includes('.test.') || filePath.includes('.spec.')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const loc = content.split('\n').length;
  
  let exportCount = 0;
  let hasUseEffect = 0;
  let hasDataFetching = false;
  let hasDirectAxiosOrFetch = false;
  let components = [];
  let interfaces = [];
  let currentComponent = null;

  function visit(node) {
    if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
      exportCount++;
    } else if (node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      exportCount++;
    }

    if (ts.isImportDeclaration(node)) {
      const text = node.moduleSpecifier.getText(sourceFile);
      if (text.includes('axios') || text.includes('fetch') || text.includes('react-query')) {
        hasDataFetching = true;
      }
      if (text.includes('axios') && !filePath.includes('api/')) {
        hasDirectAxiosOrFetch = true;
      }
    }

    if (ts.isCallExpression(node)) {
      if (node.expression.getText(sourceFile) === 'useEffect') {
        hasUseEffect++;
      }
      if (node.expression.getText(sourceFile) === 'axios' || node.expression.getText(sourceFile).startsWith('axios.')) {
        if (!filePath.includes('api/')) {
          hasDirectAxiosOrFetch = true;
        }
      }
    }

    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
       let fields = 0;
       if (ts.isInterfaceDeclaration(node)) {
         fields = node.members.length;
       } else if (ts.isTypeLiteralNode(node.type)) {
         fields = node.type.members.length;
       }
       interfaces.push({
         name: node.name.getText(sourceFile),
         fields
       });
    }

    if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      let name = '<anonymous>';
      if (ts.isFunctionDeclaration(node) && node.name) {
        name = node.name.getText(sourceFile);
      } else if (ts.isVariableStatement(node)) {
        const decl = node.declarationList.declarations[0];
        if (decl && decl.name) {
          name = decl.name.getText(sourceFile);
        }
      }

      const isComponent = name.charAt(0) === name.charAt(0).toUpperCase() && name.charAt(0) !== name.charAt(0).toLowerCase();
      if (isComponent || name.startsWith('use')) {
        let params = 0;
        let bodyLoc = 0;
        let nestedLevels = 0;
        let hooks = 0;
        
        let funcNode = node;
        if (ts.isVariableStatement(node)) {
          const init = node.declarationList.declarations[0].initializer;
          if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
            funcNode = init;
          }
        }

        if (funcNode.parameters) {
             const firstParam = funcNode.parameters[0];
             if (firstParam && ts.isObjectBindingPattern(firstParam.name)) {
                params = firstParam.name.elements.length;
             } else {
                params = funcNode.parameters.length;
             }
        }
        
        const start = sourceFile.getLineAndCharacterOfPosition(funcNode.getStart(sourceFile)).line;
        const end = sourceFile.getLineAndCharacterOfPosition(funcNode.getEnd()).line;
        bodyLoc = end - start;

        // basic nesting detection
        function countNesting(n, depth) {
          nestedLevels = Math.max(nestedLevels, depth);
          if (ts.isCallExpression(n) && n.expression.getText(sourceFile).startsWith('use')) {
            hooks++;
          }
          if (ts.isBlock(n) || ts.isIfStatement(n) || ts.isForStatement(n) || ts.isWhileStatement(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) {
            ts.forEachChild(n, child => countNesting(child, depth + 1));
          } else {
            ts.forEachChild(n, child => countNesting(child, depth));
          }
        }
        countNesting(funcNode, 0);

        components.push({
          name,
          loc: bodyLoc,
          props: params,
          nesting: nestedLevels,
          hooks
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    file: filePath.replace(projectRoot, ''),
    loc,
    exportCount,
    hasUseEffect,
    hasDataFetching,
    hasDirectAxiosOrFetch,
    components,
    interfaces
  };
}

const results = [];
walkDir(srcDir, function(filePath) {
  const res = analyzeFile(filePath);
  if (res) results.push(res);
});

fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
console.log('Analysis complete. Found', results.length, 'files');
