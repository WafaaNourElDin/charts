import React, { Component } from 'react';
import { VictoryPie, VictoryChart, VictoryBar, VictoryLine, VictoryScatter } from 'victory';
import lodash from 'lodash';
import { Grid, Row, Col, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import './bootstrap/css/bootstrap.css'
import * as moment from 'moment'
import './App.css';
import { CONST } from './const/const'
var data = require('./data/data.json');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: data,
      // used to keep data like it is when get number of orders by payment method
      paymentMethodOrderCount: data,
      // used to keep data like it is when get number of orders by time
      timeOrderCount: data,
      // used to keep data like it is when get number of orders by order amount
      orderAmountOrderCount: data,
      // used to keep data like it is when get number of orders by order branch
      branchOrdercount: data,
      // used to keep data like it is when get number of orders by order delivery area
      deliveryAreaOrderCount: data,
      // used to keep data like it is when get number of orders by order day
      orderDayOrderCount: data,
      // used to keep data like it is when get revenue by payment method
      paymentMethodRevenue: data,
      // used to keep data like it is when get revenue by time
      timeRevenue: data,
      // used to keep data like it is when get revenue by order amount
      orderAmountRevenuet: data,
      // used to keep data like it is when get revenue by order branch
      branchRevenue: data,
      // used to keep data like it is when get revenue by order delivery area
      deliveryAreaRevenue: data,
      // used to keep data like it is when get revenue by order day
      orderDayRevenue: data,
      // used to keep data like it is when get numder of orders by order date      
      orderDateOrderCount: data,
      // used to keep data like it is when get revenue by order date            
      orderDateRevenue: data,
      // date filter for orders count
      orderCountDropdownTitle: '',
      // date filter for orders revenue
      orderRevenueDropdownTitle: ''
    }
    // arrays to split the day into intervals
    this.morning = [6, 7, 8, 9, 10, 11];
    this.afternoon = [12, 13, 14, 15, 16, 17];
    this.evening = [18, 19, 20];
    this.night = [21, 22, 23, 0, 1, 2, 3, 4, 5];
    this.dateArray = [];

  }
  // function to fill dataset and take boolen parameter to know if it is revenue or order count 
  getData(isRevenue) {
    this.orderByTimeGrouped = [];
    this.orderByPriceGrouped = [];
    this.orderByPriceGrouped[CONST.ORDER_AMOUNT.lessThan10$] = [];
    this.orderByPriceGrouped[CONST.ORDER_AMOUNT.from10$TO20$] = [];
    this.orderByPriceGrouped[CONST.ORDER_AMOUNT.from20$To40$] = [];
    this.orderByPriceGrouped[CONST.ORDER_AMOUNT.from40$To70$] = [];
    this.orderByPriceGrouped[CONST.ORDER_AMOUNT.moreThan70$] = [];
    this.orderByDayGrouped = [];
    this.orderByDayGrouped[CONST.WEEK_DAYS.Saturday] = [];
    this.orderByDayGrouped[CONST.WEEK_DAYS.Sunday] = [];
    this.orderByDayGrouped[CONST.WEEK_DAYS.Monday] = [];
    this.orderByDayGrouped[CONST.WEEK_DAYS.Tuesday] = [];
    this.orderByDayGrouped[CONST.WEEK_DAYS.Wednesday] = [];
    this.orderByDayGrouped[CONST.WEEK_DAYS.Thursday] = [];
    this.orderByDayGrouped[CONST.WEEK_DAYS.Friday] = [];
    this.ordersByMonth = [];
    // dataset for charts
    if (isRevenue) {
      this.revenueByPaymentMethod = [];
      this.revenueByTime = [];
      this.revenueByPrice = [];
      this.revenueByBranch = [];
      this.revenueBydeliveryArea = [];
      this.revenueByDay = [];
      this.revenueByDate = [];
    }
    else {
      this.noOfOrdersByPaymentMethod = [];
      this.noOfOrdersByTime = [];
      this.noOfOrdersByPrice = [];
      this.noOfOrdersByBranch = [];
      this.noOfOrdersBydeliveryArea = [];
      this.noOfOrdersByDay = [];
      this.noOfOrdersByDate = [];
    }
    // # of orders and revenue by payment method
    lodash.chain(isRevenue ? this.state.paymentMethodRevenue : this.state.paymentMethodOrderCount).groupBy(CONST.FILTER_KEYS.paymentMethod).toPairs()
      .map(pair => { return lodash.zipObject(['paymentMethod', 'orders'], pair); }).value().map(order => {
        if (isRevenue) {
          const revenue = Math.round(lodash.sumBy(order.orders, (item => { return Number(item.orderAmount.replace('$', '')) })));
          return this.revenueByPaymentMethod.push({ xName: order.paymentMethod + ' ($' + revenue + ')', x: order.paymentMethod, y: revenue })
        }
        else {
          return this.noOfOrdersByPaymentMethod.push({ xName: order.paymentMethod + ' (' + order.orders.length + ' order)', x: order.paymentMethod, y: order.orders.length });
        }
      });
    // # of orders and revenue by order time
    this.orderByTimeGrouped[CONST.ORDER_PERIOD.morning] = [];
    this.orderByTimeGrouped[CONST.ORDER_PERIOD.afternoon] = [];
    this.orderByTimeGrouped[CONST.ORDER_PERIOD.evening] = [];
    this.orderByTimeGrouped[CONST.ORDER_PERIOD.night] = [];
    (isRevenue ? this.state.timeRevenue : this.state.timeOrderCount).forEach(order => {
      let dateHours = new Date(order.orderdate).getUTCHours();
      if (this.morning.includes(dateHours)) {
        this.orderByTimeGrouped[CONST.ORDER_PERIOD.morning].push(order)
      }
      if (this.afternoon.includes(dateHours)) {
        this.orderByTimeGrouped[CONST.ORDER_PERIOD.afternoon].push(order)
      }
      if (this.evening.includes(dateHours)) {
        this.orderByTimeGrouped[CONST.ORDER_PERIOD.evening].push(order)
      }
      if (this.night.includes(dateHours)) {
        this.orderByTimeGrouped[CONST.ORDER_PERIOD.night].push(order)
      }
    })
    Object.keys(this.orderByTimeGrouped).map(order => {
      if (isRevenue) {
        const revenue = Math.round(lodash.sumBy(this.orderByTimeGrouped[order], (item => { return Number(item.orderAmount.replace('$', '')) })));
        return this.revenueByTime.push({ xName: order + ' ($' + revenue + ')', x: order, y: revenue });
      }
      else {
        return this.noOfOrdersByTime.push({ xName: order + ' (' + this.orderByTimeGrouped[order].length + ' order)', x: order, y: this.orderByTimeGrouped[order].length });
      }
    });
    // # of orders and revenue by order size
    (isRevenue ? this.state.orderAmountRevenuet : this.state.orderAmountOrderCount).forEach(order => {
      const price = Number(order.orderAmount.replace('$', ''));
      if (price < 10) {
        this.orderByPriceGrouped[CONST.ORDER_AMOUNT.lessThan10$].push(order)
      }
      if (price >= 10 && price < 20) {
        this.orderByPriceGrouped[CONST.ORDER_AMOUNT.from10$TO20$].push(order)
      }
      if (price >= 20 && price < 40) {
        this.orderByPriceGrouped[CONST.ORDER_AMOUNT.from20$To40$].push(order)
      }
      if (price >= 40 && price < 70) {
        this.orderByPriceGrouped[CONST.ORDER_AMOUNT.from40$To70$].push(order)
      }
      if (price >= 70) {
        this.orderByPriceGrouped[CONST.ORDER_AMOUNT.moreThan70$].push(order)
      }
    })
    Object.keys(this.orderByPriceGrouped).map(order => {
      if (isRevenue) {
        const revenue = Math.round(lodash.sumBy(this.orderByPriceGrouped[order], (item => { return Number(item.orderAmount.replace('$', '')) })));
        return this.revenueByPrice.push({ x: order, xName: order + ' ($' + revenue + ')', y: revenue });
      }
      else {
        return this.noOfOrdersByPrice.push({ x: order, xName: order + ' (' + this.orderByPriceGrouped[order].length + ' order)', y: this.orderByPriceGrouped[order].length });
      }
    });
    // # of orders and revenue by branch
    lodash.chain(isRevenue ? this.state.branchRevenue : this.state.branchOrdercount).groupBy(CONST.FILTER_KEYS.branch).toPairs()
      .map(pair => { return lodash.zipObject(['branch', 'orders'], pair); }).value().map(order => {
        if (isRevenue) {
          const revenue = Math.round(lodash.sumBy(order.orders, (item => { return Number(item.orderAmount.replace('$', '')) })));
          return this.revenueByBranch.push({ x: order.branch, y: revenue });
        }
        else {
          return this.noOfOrdersByBranch.push({ x: order.branch, y: order.orders.length });
        }
      });
    // # of orders and revenue by delivery area
    lodash.chain(isRevenue ? this.state.deliveryAreaRevenue : this.state.deliveryAreaOrderCount).groupBy(CONST.FILTER_KEYS.deliveryArea).toPairs()
      .map(pair => { return lodash.zipObject(['deliveryArea', 'orders'], pair); }).value().map(order => {
        if (isRevenue) {
          const revenue = Math.round(lodash.sumBy(order.orders, (item => { return Number(item.orderAmount.replace('$', '')) })));
          return this.revenueBydeliveryArea.push({ x: order.deliveryArea, y: revenue });
        }
        else {
          return this.noOfOrdersBydeliveryArea.push({ x: order.deliveryArea, y: order.orders.length });
        }
      });
    if (isRevenue) {
      // order the array descending 
      this.revenueBydeliveryArea.sort((a, b) => { return b.y - a.y })
      // get top 20
      this.revenueBydeliveryArea = this.revenueBydeliveryArea.slice(0, 20);
    }
    else {
      // order the array descending 
      this.noOfOrdersBydeliveryArea.sort((a, b) => { return b.y - a.y })
      // get top 20
      this.noOfOrdersBydeliveryArea = this.noOfOrdersBydeliveryArea.slice(0, 20);
    }
    // # of orders and revenue by day of week
    (isRevenue ? this.state.orderDayRevenue : this.state.orderDayOrderCount).forEach(order => {
      let day = moment(order.orderdate).format('dddd');
      switch (day) {
        case CONST.WEEK_DAYS.Saturday:
          this.orderByDayGrouped[CONST.WEEK_DAYS.Saturday].push(order);
          break;
        case CONST.WEEK_DAYS.Sunday:
          this.orderByDayGrouped[CONST.WEEK_DAYS.Sunday].push(order);
          break;
        case CONST.WEEK_DAYS.Monday:
          this.orderByDayGrouped[CONST.WEEK_DAYS.Monday].push(order);
          break;
        case CONST.WEEK_DAYS.Tuesday:
          this.orderByDayGrouped[CONST.WEEK_DAYS.Tuesday].push(order);
          break;
        case CONST.WEEK_DAYS.Wednesday:
          this.orderByDayGrouped[CONST.WEEK_DAYS.Wednesday].push(order);
          break;
        case CONST.WEEK_DAYS.Thursday:
          this.orderByDayGrouped[CONST.WEEK_DAYS.Thursday].push(order);
          break;
        case CONST.WEEK_DAYS.Friday:
          this.orderByDayGrouped[CONST.WEEK_DAYS.Friday].push(order);
          break;
        default:
          break;
      }
    })
    Object.keys(this.orderByDayGrouped).map(order => {
      if (isRevenue) {
        const revenue = Math.round(lodash.sumBy(this.orderByDayGrouped[order], (item => { return Number(item.orderAmount.replace('$', '')) })));
        return this.revenueByDay.push({ x: order, y: revenue });
      }
      else {
        return this.noOfOrdersByDay.push({ x: order, y: this.orderByDayGrouped[order].length });
      }
    });
    // orders count and revenue by date
    this.dropdownData(isRevenue);
    this.ordersByMonth = (isRevenue ? this.state.orderDateRevenue : this.state.orderDateOrderCount).filter(item => {
      if (isRevenue) {
        return this.formatDate(item.orderdate) === (this.state.orderRevenueDropdownTitle ? this.state.orderRevenueDropdownTitle : this.dateArray[0].date);
      }
      else {
        return this.formatDate(item.orderdate) === (this.state.orderCountDropdownTitle ? this.state.orderCountDropdownTitle : this.dateArray[0].date);
      }
    })
    lodash.chain(this.ordersByMonth)
      .groupBy((order) => {
        return this.formatDate(order.orderdate, true)
      }).toPairs()
      .map(pair => { return lodash.zipObject(['orderDate', 'orders'], pair); }).value().map(order => {
        if (isRevenue) {
          const revenue = Math.round(lodash.sumBy(order.orders, (item => { return Number(item.orderAmount.replace('$', '')) })));
          return this.revenueByDate.push({ x: order.orderDate, y: revenue });
        }
        else {
          return this.noOfOrdersByDate.push({ x: order.orderDate, y: order.orders.length });
        }
      });
  }
  // function to ger dates and order them to show in dropdown
  dropdownData(isRevenue) {
    lodash.chain((isRevenue ? this.state.orderDateRevenue : this.state.orderDateOrderCount).sort((a, b) => { return new Date(a.orderdate) - new Date(b.orderdate) }))
      .groupBy((order) => {
        return this.formatDate(order.orderdate)
      }).toPairs()
      .map(pair => { return lodash.zipObject(['orderDate', 'orders'], pair); }).value().map(order => {
        return this.dateArray.push({ date: order.orderDate });
      });
  }
  changeSelectedFilterColor(chartIndex,svgIndex,pathIndex){
    const charts = document.getElementsByClassName('VictoryContainer')
    let arr = [].slice.call(document.getElementsByClassName("selected"));
    arr.forEach(item => {
      item.classList.remove("selected");
    });
    charts[chartIndex].children[0].children[svgIndex].childNodes[pathIndex].classList.add("selected");
  }
  render() {

    this.getData(false);
    this.getData(true);
    return (
      <Grid>
        <Row>
          <header>Orders Charts</header>
        </Row>
        <Row>
          <div className="container">
            <Col xs={12} md={4} className="chart-class">
              <h3>Number of orders by payment method</h3>
              <VictoryPie
                events={[{
                  target: "data",
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: "data",
                          mutation: (props) => {
                           this.changeSelectedFilterColor(0,0,props.index);
                          }
                        },
                        {

                          target: "labels",
                          mutation: (props) => {
                            this.filterData(CONST.FILTER_KEYS.paymentMethod, props.slice.data.x)
                          }
                        }
                      ];
                    }
                  }
                }]}
                data={this.noOfOrdersByPaymentMethod}
                colorScale={["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"]}
                style={{
                  data: {
                    fillOpacity: 0.7
                  },
                  labels: {
                    fontSize: 17, fill: "#333"
                  }
                }} />
            </Col>
            <Col xs={12} md={4} className="chart-class">
              <h3>Number of orders by time</h3>
              <VictoryPie
                events={[{
                  target: "data",
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: "data",
                          mutation: (props) => {
                           this.changeSelectedFilterColor(1,0,props.index);
                          }
                        },{
                        target: "labels",
                        mutation: (props) => {
                          this.filterData(CONST.FILTER_KEYS.orderdate, props.slice.data.x)
                        }
                      }
                      ];
                    }
                  }
                }]}
                data={this.noOfOrdersByTime}
                colorScale={["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"]}
                style={{
                  data: {
                    fillOpacity: 0.7
                  },
                  labels: {
                    fontSize: 17, fill: "#333"
                  }
                }} />
            </Col>
            <Col xs={12} md={4} className="chart-class">
              <h3>Number of orders by size</h3>
              <VictoryPie
                events={[{
                  target: "data",
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: "data",
                          mutation: (props) => {
                           this.changeSelectedFilterColor(2,0, props.index);
                          }
                        },
                        {
                          target: "labels",
                          mutation: (props) => {
                            this.filterData(CONST.FILTER_KEYS.orderAmount, props.slice.data.x)
                          }
                        }
                      ];
                    }
                  }
                }]}
                data={this.noOfOrdersByPrice}
                colorScale={["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"]}
                style={{
                  data: {
                    fillOpacity: 0.7
                  },
                  labels: {
                    fontSize: 17, fill: "#333"
                  }
                }} />
            </Col>
          </div>

        </Row>
        <Row>
          <div className="container">
            <Col xs={12} md={4} className="chart-class">
              <h3>Revenue by payment method</h3>
              <VictoryPie
                events={[{
                  target: "data",
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: "data",
                          mutation: (props) => {
                           this.changeSelectedFilterColor(3,0,props.index);
                          }
                        },
                        {
                          target: "labels",
                          mutation: (props) => {
                            console.log(props)
                            this.filterData(CONST.FILTER_KEYS.paymentMethod, props.slice.data.x, CONST.FILTER_KEYS.paymentMethodRevenue)
                          }
                        }
                      ];
                    }
                  }
                }]}
                data={this.revenueByPaymentMethod}
                colorScale={["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"]}
                style={{
                  data: {
                    fillOpacity: 0.7
                  },
                  labels: {
                    fontSize: 17, fill: "#333"
                  }
                }} />
            </Col>
            <Col xs={12} md={4} className="chart-class">
              <h3>Revenue of orders by time</h3>
              <VictoryPie
                events={[{
                  target: "data",
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: "data",
                          mutation: (props) => {
                           this.changeSelectedFilterColor(4,0,props.index);
                          }
                        },{
                        target: "labels",
                        mutation: (props) => {
                          this.filterData(CONST.FILTER_KEYS.orderdate, props.slice.data.x, CONST.FILTER_KEYS.orderdateRevenue)
                        }
                      }
                      ];
                    }
                  }
                }]}
                data={this.revenueByTime}
                colorScale={["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"]}
                style={{
                  data: {
                    fillOpacity: 0.7
                  },
                  labels: {
                    fontSize: 17, fill: "#333"
                  }
                }} />
            </Col>
            <Col xs={12} md={4} className="chart-class">
              <h3>Revenue of orders by size</h3>
              <VictoryPie
                events={[{
                  target: "data",
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: "data",
                          mutation: (props) => {
                           this.changeSelectedFilterColor(5,0,props.index);
                          }
                        },
                        {
                          target: "labels",
                          mutation: (props) => {
                            console.log(props)
                            this.filterData(CONST.FILTER_KEYS.orderAmount, props.slice.data.x, CONST.FILTER_KEYS.orderAmountRevenue)
                          }
                        }
                      ];
                    }
                  }
                }]}
                data={this.revenueByPrice}
                colorScale={["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"]}
                style={{
                  data: {
                    fillOpacity: 0.7
                  },
                  labels: {
                    fontSize: 17, fill: "#333"
                  }
                }} />
            </Col>
          </div>
        </Row>
        <Row>
          <div className="container">
            <Col xs={12} md={4} className="chart-class">
              <h3>Revenue by branch</h3>
              <VictoryChart
                height={500} width={500}
                domainPadding={15}
              >
                <VictoryBar horizontal
                  barWidth={30}
                  style={{ data: { fill: "#5DADE2" } }}
                  data={this.revenueByBranch}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            target: "data",
                            mutation: (props) => {
                              this.filterData(CONST.FILTER_KEYS.branch, props.datum.x, CONST.FILTER_KEYS.branchRevenue)
                              this.changeSelectedFilterColor(6,0,props.index);
                            }
                          }
                        ];
                      }
                    }
                  }]}
                />
              </VictoryChart>
            </Col>
            <Col xs={12} md={4} className="chart-class">
              <h3>Revenue by delivery area (top 20)</h3>
              <VictoryChart
                height={500} width={500}
                domainPadding={15}
              >
                <VictoryBar horizontal
                  barWidth={15}
                  padding={50}
                  style={{ data: { fill: "#5DADE2" } }}
                  data={this.revenueBydeliveryArea}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            target: "data",
                            mutation: (props) => {
                              this.filterData(CONST.FILTER_KEYS.deliveryArea, props.datum.x, CONST.FILTER_KEYS.deliveryAreaRevenue)
                              this.changeSelectedFilterColor(7,0,props.index);
                            }
                          }
                        ];
                      }
                    }
                  }]}
                />
              </VictoryChart>
            </Col>
            <Col xs={12} md={4} className="chart-class">
              <h3>Revenue by day of week</h3>
              <VictoryChart
                height={500} width={500}
                domainPadding={15}
              >
                <VictoryBar horizontal
                  barWidth={30}
                  padding={50}
                  style={{ data: { fill: "#5DADE2" } }}
                  data={this.revenueByDay}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            target: "data",
                            mutation: (props) => {
                              this.filterData(CONST.FILTER_KEYS.orderDay, props.datum.x, CONST.FILTER_KEYS.orderDayRevenue)
                              this.changeSelectedFilterColor(8,0,props.index);
                            }
                          }
                        ];
                      }
                    }
                  }]}
                />
              </VictoryChart>
            </Col>
          </div>
        </Row>
        <Row>
          <div className="container">
            <Col xs={12} md={4} className="chart-class">
              <h3>Number of orders by branch</h3>
              <VictoryChart
                height={500} width={500}
                domainPadding={15}
              >
                <VictoryBar horizontal
                  barWidth={30}
                  style={{ data: { fill: "#5DADE2" } }}
                  data={this.noOfOrdersByBranch}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            target: "data",
                            mutation: (props) => {
                              this.filterData(CONST.FILTER_KEYS.branch, props.datum.x)
                              this.changeSelectedFilterColor(9,0,props.index);
                            }
                          }
                        ];
                      }
                    }
                  }]}
                />
              </VictoryChart>
            </Col>
            <Col xs={12} md={4} className="chart-class">
              <h3>Number of orders by delivery area (top 20)</h3>
              <VictoryChart
                height={500} width={500}
                domainPadding={15}
              >
                <VictoryBar horizontal
                  barWidth={15}
                  padding={50}
                  style={{ data: { fill: "#5DADE2" } }}
                  data={this.noOfOrdersBydeliveryArea}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            target: "data",
                            mutation: (props) => {
                              this.filterData(CONST.FILTER_KEYS.deliveryArea, props.datum.x)
                              this.changeSelectedFilterColor(10,0,props.index);
                            }
                          }
                        ];
                      }
                    }
                  }]}
                />
              </VictoryChart>
            </Col>
            <Col xs={12} md={4} className="chart-class">
              <h3>Number of orders by day of week</h3>
              <VictoryChart
                height={500} width={500}
                domainPadding={15}
              >
                <VictoryBar horizontal
                  barWidth={30}
                  padding={50}
                  style={{ data: { fill: "#5DADE2" } }}
                  data={this.noOfOrdersByDay}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            target: "data",
                            mutation: (props) => {
                              this.filterData(CONST.FILTER_KEYS.orderDay, props.datum.x)
                              this.changeSelectedFilterColor(11,0,props.index);
                            }
                          }
                        ];
                      }
                    }
                  }]}
                />
              </VictoryChart>
            </Col>
          </div>
        </Row>
        <Row>
          <div className="container liner-chart">
            <Col xs={12} md={12} className="chart-class">
              <h3>Orders count by date</h3>
              <h6>choose date to filter orders </h6>
              <ButtonToolbar>
                <DropdownButton title={this.state.orderCountDropdownTitle || this.dateArray[0].date} pullRight id="split-button-pull-right">
                  {this.dateArray.map((date, index) => {
                    return (<MenuItem key={index} eventKey={index} onClick={() => { console.log(date.date); this.setState({ orderCountDropdownTitle: date.date }) }}>{date.date}</MenuItem>)

                  })}
                </DropdownButton>
              </ButtonToolbar>
              <VictoryChart height={200}>
                <VictoryLine
                  data={this.noOfOrdersByDate}
                  style={{
                    data: { stroke: "#5DADE2" },
                    labels: {
                      marginLeft: 30
                    }
                  }}
                />
                <VictoryScatter data={this.noOfOrdersByDate}
                  size={5}
                  style={{
                    data: { fill: "#5DADE2" }
                  }
                  }
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [{
                          target: "data",
                          mutation: (props) => {
                            this.filterData(CONST.FILTER_KEYS.orderFullDate, props.datum.x)
                            this.changeSelectedFilterColor(12,1,props.index);
                          }
                        }
                        ];
                      }
                    }
                  }]}
                />
              </VictoryChart>
            </Col>
            <Col xs={12} md={12} className="chart-class">
              <h3>Orders revenue by date</h3>
              <h6>choose date to filter orders </h6>
              <ButtonToolbar>
                <DropdownButton title={this.state.orderRevenueDropdownTitle || this.dateArray[0].date} pullRight id="split-button-pull-right">
                  {this.dateArray.map((date, index) => {
                    return (<MenuItem key={index} eventKey={index} onClick={() => { this.setState({ orderRevenueDropdownTitle: date.date }) }}>{date.date}</MenuItem>)

                  })}
                </DropdownButton>
              </ButtonToolbar>
              <VictoryChart height={200}>
                <VictoryLine
                  data={this.revenueByDate}
                  style={{
                    data: { stroke: "#5DADE2" },
                    labels: {
                      marginLeft: 30
                    }
                  }}
                />
                <VictoryScatter data={this.revenueByDate}
                  size={5}
                  style={{
                    data: { fill: "#5DADE2" }
                  }
                  }
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [{
                          target: "data",
                          mutation: (props) => {
                            this.filterData(CONST.FILTER_KEYS.orderFullDate, props.datum.x, CONST.FILTER_KEYS.orderDateRevenue)
                            this.changeSelectedFilterColor(13,1,props.index);
                          }
                        }
                        ];
                      }
                    }
                  }]}
                />
              </VictoryChart>
            </Col>
          </div>
        </Row>
      </Grid>
    )
  }
  // function to filter data by selected filter 
  filterData(key, value, filterKey) {
    const filteredData = this.state.data.filter(order => {
      switch (key) {
        case CONST.FILTER_KEYS.orderdate:
          let dateHours = new Date(order.orderdate).getUTCHours();
          if (value === CONST.ORDER_PERIOD.morning) {
            return this.morning.includes(dateHours);
          }
          else if (value === CONST.ORDER_PERIOD.afternoon) {
            return this.afternoon.includes(dateHours);
          }
          else if (value === CONST.ORDER_PERIOD.evening) {
            return this.evening.includes(dateHours);
          }
          else {
            return this.night.includes(dateHours);
          }
        case CONST.FILTER_KEYS.orderAmount:
          const price = Number(order[key].replace('$', ''));
          if (value === CONST.ORDER_AMOUNT.lessThan10$$) {
            return price < 10;
          }
          else if (value === CONST.ORDER_AMOUNT.from10$TO20$) {
            return price >= 10 && price < 20;
          }
          else if (value === CONST.ORDER_AMOUNT.from20$To40$) {
            return price >= 20 && price < 40;
          }
          else if (value === CONST.ORDER_AMOUNT.from40$To70$) {
            return price >= 40 && price < 70;
          }
          else {
            return price >= 70;
          }
        case CONST.FILTER_KEYS.orderDay:
          return moment(order.orderdate).format('dddd') === value;
        case CONST.FILTER_KEYS.orderFullDate:
          return this.formatDate(order.orderdate, true) === value;
        default:

          return order[key] === value;
      }
    })
    console.log(filteredData)
    // change state to rerender charts
    switch (filterKey || key) {
      case CONST.FILTER_KEYS.paymentMethod:
        this.setState({
          timeOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.orderdate:
        this.setState({
          paymentMethodOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.orderAmount:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          deliveryAreaOrderCount: filteredData,
          branchOrdercount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.branch:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.deliveryArea:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.orderDay:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          timeRevenue: filteredData,
          paymentMethodRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.orderFullDate:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.paymentMethodRevenue:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.orderdateRevenue:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.orderAmountRevenue:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.branchRevenue:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.deliveryAreaRevenue:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          orderDayRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.orderDayRevenue:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDateRevenue: filteredData
        })
        break;
      case CONST.FILTER_KEYS.orderDateRevenue:
        this.setState({
          timeOrderCount: filteredData,
          paymentMethodOrderCount: filteredData,
          orderAmountOrderCount: filteredData,
          branchOrdercount: filteredData,
          deliveryAreaOrderCount: filteredData,
          orderDayOrderCount: filteredData,
          orderDateOrderCount: filteredData,
          paymentMethodRevenue: filteredData,
          timeRevenue: filteredData,
          orderAmountRevenuet: filteredData,
          branchRevenue: filteredData,
          deliveryAreaRevenue: filteredData,
          orderDayRevenue: filteredData,
        })
        break;
      default:
        break;
    }
  }
  // function to format date from ISO to mm-yy
  formatDate(date, fulldate) {
    const dateArray = date.split('T')[0].split('-');
    if (fulldate) {
      return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0].substring(2);
    }
    else {
      return dateArray[1] + '-' + dateArray[0];

    }
  }
}
export default App;