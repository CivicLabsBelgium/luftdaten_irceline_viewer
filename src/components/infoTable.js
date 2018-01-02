import React from 'react'
import { connect } from 'react-redux'

const InfoTable = props => {

  const headers = (props.station.type === "PM") ? 'yes' : props.length

  return (
    <table>
      <tbody>
      <tr>
        <th>Sensor ID</th>
        <th style={{textDecoration: props.phenomenon === 'PM10' ? 'underline' : 'none'}}>PM10</th>
        <th style={{textDecoration: props.phenomenon === 'PM25' ? 'underline' : 'none'}}>PM2.5</th>
      </tr>
      <tr>
        <th>
        </th>
        <td>&nbsp;µg/m<sup>3</sup></td>
        <td>&nbsp;µg/m<sup>3</sup></td>
      </tr>
      <tr>
        <td colSpan="3">
          <div></div>
          <div>data by: {headers}</div>
        </td>
      </tr>
      </tbody>
    </table>
  )
/*

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
}*/
}

const infoTableStateToProps = state => {
  return {
    station: state.appState.station,
    phenomenon: state.appState.phenomenon
  }
}

export default connect(infoTableStateToProps)(InfoTable)