/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { inject, observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Breadcrumb, Permission, HeaderButtons } from '@choerodon/boot';
import { Table, Select, Spin } from 'choerodon-ui';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
import { saveAs } from 'file-saver';
import './SiteStatistics.less';
import SiteStatisticsStore from '../../../stores/global/site-statistics';
import TimePicker from '../../../components/timePicker';

const { Option } = Select;
const intlPrefix = 'c7n.site-statistics';
const colorArr = ['#FDB34E', '#5266D4', '#FD717C', '#53B9FC', '#F44336', '#6B83FC', '#B5D7FD', '#00BFA5']; // 默认取色

@withRouter
@injectIntl
@inject('AppState', 'MenuStore')
@observer
export class SiteStatistics extends Component {
  componentDidMount() {
    SiteStatisticsStore.setCurrentLevel('site');
    this.handleRefresh();
    this.ref = React.createRef();
  }

  handleRefresh = () => {
    this.initTime();
    SiteStatisticsStore.setLoading(true);
    const startDate = SiteStatisticsStore.startTime.format().split('T')[0];
    const endDate = SiteStatisticsStore.endTime.format().split('T')[0];
    SiteStatisticsStore.loadChart(startDate, endDate, SiteStatisticsStore.getCurrentLevel).then(() => {
      SiteStatisticsStore.getMenuData(SiteStatisticsStore.getCurrentLevel).then((data) => {
        SiteStatisticsStore.appendTableData(data);
      });
    });
  };

  initTime = () => {
    SiteStatisticsStore.setStartTime(moment().subtract(6, 'days'));
    SiteStatisticsStore.setEndTime(moment());
    SiteStatisticsStore.setStartDate(null);
    SiteStatisticsStore.setEndDate(null);
  };

  loadChart = () => {
    SiteStatisticsStore.setLoading(true);
    const currentLevel = SiteStatisticsStore.getCurrentLevel;
    const startDate = SiteStatisticsStore.getStartTime.format().split('T')[0];
    const endDate = SiteStatisticsStore.getEndTime.format().split('T')[0];
    SiteStatisticsStore.loadChart(startDate, endDate, currentLevel).then(() => {
      SiteStatisticsStore.getMenuData(SiteStatisticsStore.getCurrentLevel).then((data) => {
        SiteStatisticsStore.appendTableData(data);
      });
    });
  };

  getChart = () => {
    const { intl } = this.props;
    return (
      <div className="c7n-iam-site-statistics-third-container">
        <Spin spinning={SiteStatisticsStore.loading}>
          <div className="c7n-iam-site-statistics-third-container-timewrapper">
            <TimePicker
              showDatePicker
              startTime={SiteStatisticsStore.getStartDate}
              endTime={SiteStatisticsStore.getEndDate}
              func={this.loadChart}
              handleSetStartTime={(startTime) => SiteStatisticsStore.setStartTime(startTime)}
              handleSetEndTime={(endTime) => SiteStatisticsStore.setEndTime(endTime)}
              handleSetStartDate={(startTime) => SiteStatisticsStore.setStartDate(startTime)}
              handleSetEndDate={(endTime) => SiteStatisticsStore.setEndDate(endTime)}
            />
            <div style={{ flex: 1 }}>
              <Select
                style={{ width: 'calc(100% - 60px)', marginLeft: 'calc(16px + 6%)', marginRight: '16px' }}
                value={SiteStatisticsStore.currentLevel}
                // getPopupContainer={() => findDOMNode(this.ref.current)}
                onChange={this.handleChange.bind(this)}
                label={<FormattedMessage id={`${intlPrefix}.belong`} />}
              >
                {this.getOptionList()}
              </Select>
            </div>
          </div>
          <ReactEcharts
            className="c7n-iam-site-statistics-third-chart"
            style={{ width: '100%', height: 400 }}
            option={this.getChartOption()}
            notMerge
          />
        </Spin>
      </div>
    );
  };

  getTable = () => (
    <Table
      columns={this.getTableColumns()}
      dataSource={SiteStatisticsStore.getTableData.slice()}
      rowKey="code"
      fixed
    />
  );

  getTableColumns() {
    return [
      {
        title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        filters: [],
        onFilter: (value, record) => record.name.toString().indexOf(value) === 0,
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.table.code`} />,
        dataIndex: 'code',
        key: 'code',
        width: '50%',
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.table.click-sum`} />,
        dataIndex: 'sum',
        key: 'sum',
        width: '20%',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.sum - b.sum,
      },
    ];
  }

  getOptionList() {
    const { intl } = this.props;
    const level = ['site', 'project', 'organization', 'user'];
    return (
      level.map((name, index) => (
        <Option key={index} value={name}>{intl.formatMessage({ id: name })}</Option>
      ))
    );
  }

  handleChange(level) {
    SiteStatisticsStore.setCurrentLevel(level);
    // SiteStatisticsStore.getMenuData(level).then((data) => {
    //   SiteStatisticsStore.appendTableData(data);
    // });
    this.loadChart();
  }

  getChartOption() {
    const { intl: { formatMessage } } = this.props;
    const chartData = SiteStatisticsStore.getChartData;
    const copyChartData = JSON.parse(JSON.stringify(chartData));
    let handledData = [];
    let handledApis = {};
    if (chartData) {
      handledData = chartData.details.map((item) => ({
        type: 'line',
        name: `${item.menu.split(':')[1]}: ${item.menu.split(':')[0]}`,
        data: item.data,
        smooth: 0.2,
      }));
      if (copyChartData.menu.length) {
        copyChartData.menu.forEach((item) => { handledApis[item] = false; });
        const selectedApis = copyChartData.menu.splice(0, 10);
        selectedApis.forEach((item) => { handledApis[item] = true; });
      } else {
        handledApis = {};
      }
    }

    return {
      title: {
        text: formatMessage({ id: `${intlPrefix}.menu.count` }),
        textStyle: {
          color: 'rgba(15, 19, 88, 0.87)',
          fontWeight: '400',
        },
        top: 20,
        left: 16,
      },
      tooltip: {
        trigger: 'item',
        confine: true,
        borderWidth: 1,
        backgroundColor: '#fff',
        borderColor: '#DDDDDD',
        extraCssText: 'box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20)',
        textStyle: {
          fontSize: 13,
          color: '#000000',
        },

        formatter(params) {
          return `<div>
              <div>${params.name}</div>
              <div><span class="c7n-iam-sitestatics-charts-tooltip" style="background-color:${params.color};"></span>${params.seriesName}</div>
              <div>${formatMessage({ id: 'boot.times' })}: ${params.value}</div>
            <div>`;
        },
      },
      legend: {
        show: true,
        type: 'scroll',
        orient: 'vertical', // 图例纵向排列
        itemHeight: 11,
        top: 80,
        left: '72%',
        // right: 5,
        icon: 'circle',
        height: '70%',
        data: chartData ? chartData.menu : [],
        selected: handledApis,
        formatter(name) {
          const showLength = 44; // 截取长度
          // eslint-disable-next-line prefer-destructuring
          name = name.split(':')[1];
          if (name.length > showLength) {
            name = `${name.substring(0, showLength)}...`;
          }
          return name;
        },
        tooltip: {
          show: true,
          formatter(item) {
            return item.name;
          },
        },
      },
      grid: {
        left: '3%',
        top: 110,
        containLabel: true,
        width: '66%',
        height: '62.5%',
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: '#eee',
              type: 'solid',
              width: 2,
            },
            onZero: true,
          },
          axisLabel: {
            margin: 7, // X轴文字和坐标线之间的间距
            textStyle: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 12,
            },
            formatter(value) {
              const month = value.split('-')[1];
              const day = value.split('-')[2];
              return `${month}/${day}`;
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#eee'],
              width: 1,
              type: 'solid',
            },
          },
          data: chartData ? chartData.date : [],
        },
      ],
      yAxis: [
        {
          type: 'value',
          minInterval: 1,
          name: formatMessage({ id: 'boot.times' }),
          nameLocation: 'end',
          nameTextStyle: {
            color: '#000',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#eee',
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#eee'],
            },
          },
          axisLabel: {
            color: 'rgba(0,0,0,0.65)',
          },
        },
      ],
      series: handledData,
      color: colorArr,
    };
  }

  clickDownload = () => {
    const { intl } = this.props;
    let str = `时间范围：${SiteStatisticsStore.startTime.format().split('T')[0].replace('-', '.')} -- ${SiteStatisticsStore.endTime.format().split('T')[0].replace('-', '.')}\n菜单名称,菜单编码,菜单点击总数,层级`;
    SiteStatisticsStore.getAllTableDate().then((data) => {
      data.forEach((v) => {
        str += `\n${v.name},${v.code},${v.sum},${intl.formatMessage({ id: v.level })}`;
      });
      str = encodeURIComponent(str);
      saveAs(`data:text/csv;charset=utf-8,\ufeff${str}`, this.getDownloadName())
    });
  };

  getDownloadName = () => {
    const momentTime = moment(new Date().getTime());
    return `平台菜单统计-${momentTime.format('YYYYMMDDHHmm')}.csv`;
  };

  render() {
    return (
      <Page
        service={[
          'choerodon.code.site.operation.manager.menu-statistics.ps.default',
        ]}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <HeaderButtons
            items={([{
              name: <FormattedMessage id={`${intlPrefix}.export`} />,
              icon: 'unarchive-o',
              display: true,
              permissions: ['choerodon.code.site.operation.manager.menu-statistics.ps.export'],
              handler: this.clickDownload,
            }])}
            showClassName={false}
          />
        </Header>
        <Breadcrumb />
        <Content ref={this.ref}>
          {this.getChart()}
          {this.getTable()}
        </Content>
      </Page>
    );
  }
}

const SiteStatisticsIndex = () => (
  <Permission
    service={['choerodon.code.site.operation.manager.menu-statistics.ps.default']}
  >
    <SiteStatistics />
  </Permission>
);

export default SiteStatisticsIndex;
