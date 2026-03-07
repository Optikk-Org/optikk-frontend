import React from 'react';
import { Link } from 'react-router-dom';
import './PageHeader.css';

interface PageHeaderBreadcrumb {
  label: React.ReactNode;
  path?: string;
}

interface PageHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: PageHeaderBreadcrumb[];
}

export default function PageHeader({
  title,
  icon,
  subtitle,
  actions,
  breadcrumbs = [],
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__content">
        {icon && <div className="page-header__icon">{icon}</div>}
        <div className="page-header__text">
          {breadcrumbs.length > 0 && (
            <div className="page-header__subtitle" style={{ marginBottom: 4 }}>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={`${String(breadcrumb.label)}-${index}`}>
                  {index > 0 ? ' / ' : null}
                  {breadcrumb.path ? (
                    <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                  ) : (
                    <span>{breadcrumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}
