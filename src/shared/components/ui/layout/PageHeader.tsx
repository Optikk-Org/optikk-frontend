import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '@shared/design-system/components/Breadcrumbs';
import { useBreadcrumbs } from '@shared/hooks/useBreadcrumbs';
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
  /** Auto-generate breadcrumbs from current route (overrides manual breadcrumbs) */
  autoBreadcrumbs?: boolean;
}

export default function PageHeader({
  title,
  icon,
  subtitle,
  actions,
  breadcrumbs = [],
  autoBreadcrumbs = true,
}: PageHeaderProps) {
  const routeCrumbs = useBreadcrumbs();

  const showAutoCrumbs = autoBreadcrumbs && breadcrumbs.length === 0 && routeCrumbs.length > 1;

  return (
    <div className="page-header">
      {showAutoCrumbs && (
        <Breadcrumbs items={routeCrumbs} className="page-header__breadcrumbs" />
      )}
      {breadcrumbs.length > 0 && (
        <div className="page-header__manual-crumbs">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={`${String(breadcrumb.label)}-${index}`}>
              {index > 0 ? <span className="page-header__crumb-sep">/</span> : null}
              {breadcrumb.path ? (
                <Link to={breadcrumb.path} className="page-header__crumb-link">{breadcrumb.label}</Link>
              ) : (
                <span className="page-header__crumb-text">{breadcrumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="page-header__row">
        <div className="page-header__content">
          {icon && <div className="page-header__icon">{icon}</div>}
          <div className="page-header__text">
            <h1 className="page-header__title">{title}</h1>
            {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>
  );
}
