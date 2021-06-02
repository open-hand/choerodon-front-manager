import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncLocaleProvider, asyncRouter, nomatch } from '@choerodon/boot';
import { ModalContainer } from 'choerodon-ui/pro';

const siteStatistics = asyncRouter(() => import('./global/site-statistics'));

@inject('AppState')
class IAMIndex extends React.Component {
  render() {
    const { match, AppState } = this.props;
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../locale/${langauge}`));
    return (
      <IntlProviderAsync>
        <React.Fragment>
          <Switch>
            <Route path={`${match.url}/site-statistics`} component={siteStatistics} />
            <Route path="*" component={nomatch} />
          </Switch>
          <ModalContainer />
        </React.Fragment>
      </IntlProviderAsync>
    );
  }
}

export default IAMIndex;
