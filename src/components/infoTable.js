import React from 'react'
import { connect } from 'react-redux'

const InfoTable = props => {


  if (props.data.length === 0)
    return null

  let sumCol1 = 0
  let countCol1 = 0
  let sumCol2 = 0
  let countCol2 = 0

  const sensorList = props.data.map(
    sensor => {
      let col1Value, col1Unit, col2Value, col2Unit
      if (sensor.PM10 || sensor.PM25) {
        col1Value = sensor.PM10
        col1Unit = <span>&nbsp;µg/m<sup>3</sup></span>
        col2Value = sensor.PM25
        col2Unit = <span>&nbsp;µg/m<sup>3</sup></span>
      } else if (sensor.temperature || sensor.humidity) {
        col1Value = sensor.temperature
        col1Unit = <span>&nbsp;°C</span>
        col2Value = sensor.humidity
        col2Unit = <span>&nbsp;&#37;</span>
      }

      if (col1Value) {
        sumCol1 += parseFloat(col1Value)
        countCol1++
        col1Value = <span>{col1Value}{col1Unit}</span>
      }
      else
        col1Value = '-'

      if (col2Value) {
        sumCol2 += parseFloat(col2Value)
        countCol2++
        col2Value = <span>{col2Value}{col2Unit}</span>
      }
      else
        col2Value = '-'

      return (
        <tr key={sensor.id}>
          <td>{sensor.id} (station {sensor.stationID})</td>
          <td>{col1Value}</td>
          <td>{col2Value}</td>
        </tr>
      )
    }
  )

  let meanCol1 = (sumCol1/countCol1).toFixed(2)
  if(isNaN(meanCol1))
    meanCol1 = '-'
  let meanCol2 = (sumCol2/countCol2).toFixed(2)
  if(isNaN(meanCol2))
    meanCol2 = '-'

  if (props.type === 'partsPerMillion')
    return (
      <table>
        <tbody>
        <tr>
          <th>Sensor&nbsp;ID</th>
          <th style={{textDecoration: props.phenomenon === 'PM10' ? 'underline' : 'none'}}>PM10</th>
          <th style={{textDecoration: props.phenomenon === 'PM25' ? 'underline' : 'none'}}>PM2.5</th>
        </tr>
        {
          (countCol1 <= 1 && countCol2 <= 1) ? null : (
            <tr>
              <td>Mean</td>
              <td>{meanCol1}&nbsp;µg/m<sup>3</sup></td>
              <td>{meanCol2}&nbsp;µg/m<sup>3</sup></td>
            </tr>
          )
        }
        {sensorList}
        </tbody>
      </table>
    )
  if (props.type === 'tempAndHum')
    return (
      <table>
        <tbody>
        <tr>
          <th>Sensor&nbsp;ID</th>
          <th style={{textDecoration: props.phenomenon === 'temperature' ? 'underline' : 'none'}}>Temp.</th>
          <th style={{textDecoration: props.phenomenon === 'humidity' ? 'underline' : 'none'}}>Hum.</th>
        </tr>
        {
          (countCol1 <= 1 && countCol2 <= 1) ? null : (
            <tr>
              <td>Mean</td>
              <td>{meanCol1}&nbsp;°C</td>
              <td>{meanCol2}&nbsp;&#37;</td>
            </tr>
          )
        }
        {sensorList}
        </tbody>
      </table>
    )
}

const infoTableStateToProps = state => {
  return {
    // station: state.appState.station,
    phenomenon: state.appState.phenomenon
  }
}

export default connect(infoTableStateToProps)(InfoTable)