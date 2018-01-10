import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setCurrentStationList } from '../redux/appState/actions'
import InfoTable from './infoTable'

class Sidebar extends Component {

  getSensorList () {
    let sensorList = {
      partsPerMillion: [],
      tempAndHum: []
    }
    //TODO refactor to foreach
    this.props.stationList.map(
      station => {
        station.sensors.map(
          sensor => {
            sensor.origin = station.origin
            sensor.lat = station.latitude
            sensor.lng = station.longitude
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
    if (!this.props.stationList)
      return null
    const sensors = this.getSensorList()
    const count = sensors.partsPerMillion.length + sensors.tempAndHum.length

    return (
      <div className="sidebar">
        <div className="container">
          <div className="closeBtn">
            <button onClick={() => this.props.onChangeCurrentStation()}>close</button>
            <br/>
          </div>
          <span># selected sensors: {count}</span>
          <InfoTable type="partsPerMillion" data={sensors.partsPerMillion}/>
          <InfoTable type="tempAndHum" data={sensors.tempAndHum}/>
        </div>
      </div>
    )
  }

}

const mapStateToProps = state => {
  return {
    stationList: state.appState.stationList,
    phenomenon: state.appState.phenomenon
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChangeCurrentStation: () => {
      dispatch(setCurrentStationList(null))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)