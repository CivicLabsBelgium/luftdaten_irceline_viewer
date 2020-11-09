/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint multiline-ternary: ["error", "always"] */
import React from 'react'
import { connect } from 'react-redux'
import { setCurrentSensor, setID } from '../redux/appState/actions'
import store from '../redux/store'
import * as genericFunctions from '../utilities/genericFunctions'

class InfoTable extends React.Component {
  findNearestIrcelineStationForAllLuftdatenStations (data) {
    const ircelineStations = this.props.stations.filter(sensor => sensor.origin === 'irceline')

    return data.map(
      sensor => {
        if (sensor.origin === 'luftdaten') {
          const geolocation = {
            latitude: sensor.lat,
            longitude: sensor.lng
          }
          const nearest = this.nearestIrceline(geolocation, ircelineStations)
          sensor.nearestIrceline = nearest && nearest.sensors.reduce(
            (accumulator, sensor) => {
              accumulator.PM10 = sensor.PM10 || accumulator.PM10
              accumulator.PM25 = sensor.PM25 || accumulator.PM25
              accumulator.temperature = sensor.temperature || accumulator.temperature
              accumulator.humidity = sensor.humidity || accumulator.humidity
              accumulator.pressure = sensor.pressure || accumulator.pressure
              accumulator.idP = ((sensor.PM10 || sensor.PM25) && sensor.id) || accumulator.idP
              accumulator.idT = ((sensor.temperature || sensor.humidity || sensor.pressure) && sensor.id) || accumulator.idT
              return accumulator
            },
            {
              idP: undefined,
              idT: undefined,
              PM10: undefined,
              PM25: undefined,
              temperature: undefined,
              humidity: undefined,
              pressure: undefined
            }
          )
        }
        return sensor
      }
    )
  }

  nearestIrceline = (geolocation, ircelineStations) => {
    if (store.getState().appState.dataOrigin.luftdaten === false) return

    const nearestIrceline = ircelineStations.reduce(
      (nearest, station) => {
        const distance = genericFunctions.getDistanceFromLatLonInKm(geolocation.latitude, geolocation.longitude, station.latitude, station.longitude)
        return distance <= nearest.distance && distance <= this.props.globalConfig.nearestIrcelineStationRange
          ? {
              distance,
              station
            }
          : nearest
      },
      {
        distance: this.props.globalConfig.nearestIrcelineStationRange,
        station: null
      }
    )

    return nearestIrceline.station
  }

  render () {
    const props = this.props

    if (props.data.length === 0) return null

    let sumCol1 = 0
    let countCol1 = 0
    let sumCol2 = 0
    let countCol2 = 0
    let sumCol3 = 0
    let countCol3 = 0

    const data = this.props.globalConfig.showNearestIrcelineStation && props.origin.irceline
      ? this.findNearestIrcelineStationForAllLuftdatenStations(props.data)
      : props.data
    const sensorList = data.map(
      sensor => {
        // TODO Keep or not?
        if (props.origin[sensor.origin] === false) return null

        let col1Value, col1Unit, col2Value, col2Unit, col3Value, col3Unit, nearestCol1Value, nearestCol2Value,
          nearestCol3Value, nearestId, col1Hourly, col2Hourly, col3Hourly, col1Daily, col2Daily, col3Daily
        if (sensor.PM10 || sensor.PM25) {
          col1Value = sensor.PM10
          col1Unit = <span>&nbsp;µg/m<sup>3</sup></span>
          col2Value = sensor.PM25
          col2Unit = <span>&nbsp;µg/m<sup>3</sup></span>
          nearestCol1Value = sensor.nearestIrceline && sensor.nearestIrceline.PM10 &&
            <span>{sensor.nearestIrceline.PM10.toFixed(2)}{col1Unit}</span>
          nearestCol2Value = sensor.nearestIrceline && sensor.nearestIrceline.PM25 &&
            <span>{sensor.nearestIrceline.PM25.toFixed(2)}{col2Unit}</span>
          nearestId = sensor.nearestIrceline && sensor.nearestIrceline.idP
          col1Hourly = sensor.hourly && sensor.hourly.PM10 && <span>{sensor.hourly.PM10}{col1Unit}</span>
          col2Hourly = sensor.hourly && sensor.hourly.PM25 && <span>{sensor.hourly.PM25}{col2Unit}</span>
          col1Daily = sensor.daily && sensor.daily.PM10 && <span>{sensor.daily.PM10}{col1Unit}</span>
          col2Daily = sensor.daily && sensor.daily.PM25 && <span>{sensor.daily.PM25}{col2Unit}</span>
        } else if (sensor.temperature || sensor.humidity || sensor.pressure) {
          col1Value = sensor.temperature
          col1Unit = <span>&nbsp;°C</span>
          col2Value = sensor.humidity
          col2Unit = <span>&nbsp;&#37;</span>
          col3Value = sensor.pressure
          col3Unit = <span>&nbsp;hPa</span>
          nearestCol1Value = sensor.nearestIrceline && sensor.nearestIrceline.temperature &&
            <span>{sensor.nearestIrceline.temperature.toFixed(2)}{col1Unit}</span>
          nearestCol2Value = sensor.nearestIrceline && sensor.nearestIrceline.humidity &&
            <span>{sensor.nearestIrceline.humidity.toFixed(2)}{col2Unit}</span>
          nearestCol3Value = sensor.nearestIrceline && sensor.nearestIrceline.pressure &&
            <span>{sensor.nearestIrceline.pressure.toFixed(2)}{col3Unit}</span>
          nearestId = sensor.nearestIrceline && sensor.nearestIrceline.idT
          col1Hourly = sensor.hourly && sensor.hourly.temperature && <span>{sensor.hourly.temperature}{col1Unit}</span>
          col2Hourly = sensor.hourly && sensor.hourly.humidity && <span>{sensor.hourly.humidity}{col2Unit}</span>
          col3Hourly = sensor.hourly && sensor.hourly.pressure && <span>{sensor.hourly.pressure}{col3Unit}</span>
          col1Daily = sensor.daily && sensor.daily.temperature && <span>{sensor.daily.temperature}{col1Unit}</span>
          col2Daily = sensor.daily && sensor.daily.humidity && <span>{sensor.daily.humidity}{col2Unit}</span>
          col3Daily = sensor.daily && sensor.daily.pressure && <span>{sensor.daily.pressure}{col3Unit}</span>
        }

        if (col1Value) {
          sumCol1 += parseFloat(col1Value)
          countCol1++
          col1Value = <span>{col1Value}{col1Unit}</span>
        } else {
          col1Value = '-'
        }

        if (col2Value) {
          sumCol2 += parseFloat(col2Value)
          countCol2++
          col2Value = <span>{col2Value}{col2Unit}</span>
        } else {
          col2Value = '-'
        }

        if (col3Value) {
          sumCol3 += parseFloat(col3Value)
          countCol3++
          col3Value = parseFloat(col3Value)
          col3Value = col3Value.toFixed(2)
          col3Value = <span>{col3Value}{col3Unit}</span>
        } else {
          col3Value = '-'
        }

        return (
          <React.Fragment key={sensor.id}>
            <tr className={
              (props.sensor === sensor.id)
                ? 'sensor selected'
                : 'sensor'
            } onClick={() => props.onChangeCurrentSensor(sensor.id)}>
              <td>
                <span className='a' onClick={() => { props.onSetID(sensor.id) }}>{sensor.id}</span>
              </td>
              <td>{col1Value}</td>
              <td>{col2Value}</td>
              {
                (props.type === 'tempAndHum')
                  ? <td>{col3Value}</td>
                  : null
              }
            </tr>
            {
              (props.sensor === sensor.id)
                ? <React.Fragment>
                {
                  (col1Hourly || col2Hourly || col3Hourly) &&
                  <tr className='selected'>
                    <td>{this.props.lang.mean} ({this.props.lang.hourly})</td>
                    <td>{col1Hourly || '-'}</td>
                    <td>{col2Hourly || '-'}</td>
                    {
                      (props.type === 'tempAndHum')
                        ? <td>{col3Hourly || '-'}</td>
                        : null
                    }
                  </tr>
                }
                {
                  (col1Daily || col2Daily || col3Daily) &&
                  <tr className='selected'>
                    <td>{this.props.lang.mean} ({this.props.lang.daily})</td>
                    <td>{col1Daily || '-'}</td>
                    <td>{col2Daily || '-'}</td>
                    {
                      (props.type === 'tempAndHum')
                        ? <td>{col3Daily || '-'}</td>
                        : null
                    }
                  </tr>
                }
                {
                  sensor.nearestIrceline && props.origin.irceline
                    ? <tr className='selected'>
                      <td><span className='a' onClick={() => { props.onSetID(nearestId) }}>{this.props.lang.nearestIrcelineStation}</span>
                      </td>
                      <td>{nearestCol1Value || '-'}</td>
                      <td>{nearestCol2Value || '-'}</td>
                      {
                        (props.type === 'tempAndHum')
                          ? <td>{nearestCol3Value || '-'}</td>
                          : null
                      }
                    </tr>
                    : null
                }
                <tr className='selected'>
                  <td>Station ID</td>
                  <td colSpan='3'>{sensor.stationID}</td>
                </tr>
                <tr className='selected'>
                  <td>{this.props.lang.name}</td>
                  <td colSpan='3'>{sensor.name}</td>
                </tr>
                <tr className='selected'>
                  <td>{this.props.lang.source}</td>
                  <td colSpan='3'><a target='_blank' href={(sensor.origin === 'irceline')
                    ? 'http://www.irceline.be/'
                    : (sensor.origin === 'luftdaten')
                        ? 'http://luftdaten.info/'
                        : ''
                        } rel="noreferrer">{sensor.origin}</a>
                  </td>
                </tr>
                <tr className='selected'>
                  <td>{this.props.lang.location}</td>
                  <td colSpan='3'>
                    <span>lat: {sensor.lat},<br/> long: {sensor.lng},<br/> alt: {sensor.alt}</span>
                  </td>
                </tr>
              </React.Fragment>
                : null
            }

          </React.Fragment>
        )
      }
    )

    let meanCol1 = (sumCol1 / countCol1).toFixed(2)
    if (isNaN(meanCol1)) meanCol1 = '-'
    let meanCol2 = (sumCol2 / countCol2).toFixed(2)
    if (isNaN(meanCol2)) meanCol2 = '-'
    let meanCol3 = (sumCol3 / countCol3).toFixed(2)
    if (isNaN(meanCol3)) meanCol3 = '-'

    // TODO shorten

    if (props.type === 'partsPerMillion') {
      return (
        <table>
          <tbody>
          <tr className='headers'>
            <th>Sensor&nbsp;ID</th>
            <th style={{
              textDecoration: props.phenomenon === 'PM10'
                ? 'underline'
                : 'none'
            }
            }>PM10</th>
            <th style={{
              textDecoration: props.phenomenon === 'PM25'
                ? 'underline'
                : 'none'
            }
            }>PM2.5</th>
          </tr>
          {
            (countCol1 <= 1 && countCol2 <= 1)
              ? null
              : (
                <tr className='mean'>
                  <th>{this.props.lang.mean} ({this.props.lang.selected})</th>
                  <td>{meanCol1}&nbsp;µg/m<sup>3</sup></td>
                  <td>{meanCol2}&nbsp;µg/m<sup>3</sup></td>
                </tr>
                )
          }
          {sensorList}
          </tbody>
        </table>
      )
    }
    if (props.type === 'tempAndHum') {
      return (
        <table>
          <tbody>
          <tr className='headers'>
            <th>Sensor&nbsp;ID</th>
            <th style={{
              textDecoration: props.phenomenon === 'temperature'
                ? 'underline'
                : 'none'
            }
            }>{this.props.lang.temp}</th>
            <th style={{
              textDecoration: props.phenomenon === 'humidity'
                ? 'underline'
                : 'none'
            }
            }>{this.props.lang.hum}</th>
            <th style={{
              textDecoration: props.phenomenon === 'pressure'
                ? 'underline'
                : 'none'
            }
            }>{this.props.lang.pres}</th>
          </tr>
          {
            (countCol1 <= 1 && countCol2 <= 1 && countCol3 <= 1)
              ? null
              : (
                <tr className='mean'>
                  <th>{this.props.lang.mean} ({this.props.lang.selected})</th>
                  <td>{meanCol1}&nbsp;°C</td>
                  <td>{meanCol2}&nbsp;&#37;</td>
                  <td>{meanCol3}&nbsp;hPa</td>
                </tr>
                )
          }
          {sensorList}
          </tbody>
        </table>
      )
    }
  }
}

const mapStateToProps = state => {
  return {
    phenomenon: state.appState.phenomenon,
    sensor: state.appState.sensor,
    origin: { ...state.appState.dataOrigin },
    stations: state.stationUpdates.stations,
    globalConfig: state.globalConfig,
    lang: state.appState.lang
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChangeCurrentSensor: sensor => {
      dispatch(setCurrentSensor(sensor))
    },
    // TODO remove if unecessary
    // onSetMapCoords: coords => {
    //   dispatch(setMapCoords(coords))
    // },
    onSetID: id => {
      dispatch(setID(id))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoTable)
