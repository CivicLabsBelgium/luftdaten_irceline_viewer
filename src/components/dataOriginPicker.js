import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setDataOrigin } from '../redux/appState/actions'

class DataOriginPicker extends Component {
  render () {
    const luftdaten_toggle = this.props.dataOrigin.luftdaten
    const irceline_toggle = this.props.dataOrigin.irceline
    const luftdatenIsReachable = this.props.luftdatenIsReachable
    const ircelineIsReachable = this.props.ircelineIsReachable
    const luftdatenIsUpdating = this.props.luftdatenIsUpdating
    const ircelineIsUpdating = this.props.ircelineIsUpdating

    return (
      <div className="data-origin-picker">
        <span>filter</span>
        <button
          className={luftdatenIsReachable? '' : 'unreachable'}

          onClick={() => this.props.onChangeDataOrigin({
          luftdaten: !luftdaten_toggle,
          irceline: irceline_toggle
        })}>
          {
            (luftdatenIsReachable) ? (
              (luftdatenIsUpdating) ? '\u231B' :
              (luftdaten_toggle) ? '\u2714' : '\u2715'
            ) : '\u2205'
          }
          &nbsp;Luftdaten
        </button>
        <button
          className={ircelineIsReachable? '' : 'unreachable'}
          onClick={() => this.props.onChangeDataOrigin({
          luftdaten: luftdaten_toggle,
          irceline: !irceline_toggle
        })}>
          {
            (ircelineIsReachable) ? (
              (ircelineIsUpdating) ? '\u231B' :
                (irceline_toggle) ? '\u2714' : '\u2715'
            ) : '\u2205'
          }
          &nbsp;Irceline
        </button>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    dataOrigin: state.appState.dataOrigin,
    luftdatenIsReachable: state.stations.isReachable.luftdaten,
    ircelineIsReachable: state.stations.isReachable.irceline,
    luftdatenIsUpdating: state.stations.isUpdating.luftdaten,
    ircelineIsUpdating: state.stations.isUpdating.irceline,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChangeDataOrigin: (dataOrigin) => {
      dispatch(setDataOrigin(dataOrigin))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataOriginPicker)
