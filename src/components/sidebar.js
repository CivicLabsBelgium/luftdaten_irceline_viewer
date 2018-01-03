import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setCurrentStation } from '../redux/appState/actions'
import InfoTable from './infoTable'

class Sidebar extends Component {
  /*

    partsPerMillionTable (partsPerMillionSensor) {
      if (!partsPerMillionSensor) {
        return null
      }
      return (
        <table>
          <tbody>
          <tr>
            <th>Sensor ID</th>
            <th style={ {textDecoration: this.props.phenomenon === 'PM10' ? 'underline':'none' } }>PM10</th>
            <th style={ {textDecoration: this.props.phenomenon === 'PM25' ? 'underline':'none' } }>PM2.5</th>
          </tr>
          <tr>
            <th>
              {partsPerMillionSensor.id}
            </th>
            <td>{partsPerMillionSensor.PM10 || '?'}&nbsp;µg/m<sup>3</sup></td>
            <td>{partsPerMillionSensor.PM25 || '?'}&nbsp;µg/m<sup>3</sup></td>
          </tr>
          <tr>
            <td colSpan="3">
              <div>{partsPerMillionSensor.manufacturer} {partsPerMillionSensor.name}</div>
              <div>data by: {this.props.station.origin}</div>
            </td>
          </tr>
          </tbody>
        </table>
      )
    }

    tempAndHumTable (tempAndHumSensor) {
      if (!tempAndHumSensor) {
        return null
      }
      return (
        <table>
          <tbody>
          <tr>
            <th>Sensor ID</th>
            <th style={ {textDecoration: this.props.phenomenon === 'temperature' ? 'underline':'none' } }>temperature</th>
            <th style={ {textDecoration: this.props.phenomenon === 'humidity' ? 'underline':'none' } }>humidity</th>
          </tr>
          <tr>
            <th>{tempAndHumSensor.id}</th>
            <td>{tempAndHumSensor.temperature || '?'}°C</td>
            <td>{tempAndHumSensor.humidity || '?'}&nbsp;&#37;</td>
          </tr>
          <tr>
            <td colSpan="3">
              <div>{tempAndHumSensor.manufacturer}, {tempAndHumSensor.name}</div>
              <div>data by: {this.props.station.origin}</div>
            </td>
          </tr>
          </tbody>
        </table>
      )
    }


  /*****************/

  getSensorList () {
    let sensorList = {
      partsPerMillion: [],
      tempAndHum: []
    }
    this.props.station.map(
      station => {
        station.sensors.map(
          sensor => {
            sensor.stationID = station.id
            sensor.origin = station.origin
            if (sensor.PM10 || sensor.PM25) {
              sensorList.partsPerMillion.push(sensor)
            } else if (sensor.temperature || sensor.humidity) {
              sensorList.tempAndHum.push(sensor)
            }
          }
        )
      }
    )

    return sensorList
  }

  render () {
    if (!this.props.station)
      return null
    const sensors = this.getSensorList()

    return (
      <div className="sidebar">
        <div className="container">
          <div className="closeBtn">
            <button onClick={() => this.props.onChangeCurrentStation()}>close</button>
          </div>
          <InfoTable type="partsPerMillion" data={sensors.partsPerMillion}/>
          <InfoTable type="tempAndHum" data={sensors.tempAndHum}/>
        </div>
      </div>
    )
  }

}

const sidebarStateToProps = state => {
  return {
    station: state.appState.station,
    phenomenon: state.appState.phenomenon
  }
}

const sidebarDispatchToProps = dispatch => {
  return {
    onChangeCurrentStation: () => {
      dispatch(setCurrentStation(null))
    }
  }
}

export default connect(sidebarStateToProps, sidebarDispatchToProps)(Sidebar)