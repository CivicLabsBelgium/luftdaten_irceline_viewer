import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setCurrentStation } from '../redux/appState/actions'
import InfoTable from './infoTable'

class Sidebar extends Component {


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
            return null
          }
        )
        return null
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