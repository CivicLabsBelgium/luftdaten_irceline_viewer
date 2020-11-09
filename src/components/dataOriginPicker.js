/* eslint multiline-ternary: ["error", "always"] */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setDataOrigin } from '../redux/appState/actions'

class DataOriginPicker extends Component {
  render () {
    const luftdatenToggle = this.props.dataOrigin.luftdaten
    const ircelineToggle = this.props.dataOrigin.irceline
    const luftdatenIsReachable = this.props.luftdatenIsReachable
    const ircelineIsReachable = this.props.ircelineIsReachable
    const luftdatenIsUpdating = this.props.luftdatenIsUpdating
    const ircelineIsUpdating = this.props.ircelineIsUpdating

    return (
      <div className="data-origin-picker">
        <span>filter</span>
        <button
          className={luftdatenIsReachable
            ? ''
            : 'unreachable'}

          onClick={() => this.props.onChangeDataOrigin({
            luftdaten: !luftdatenToggle,
            irceline: ircelineToggle
          })}>
          {
            (luftdatenIsReachable)
              ? ((luftdatenIsUpdating)
                  ? '\u231B'
                  : (luftdatenToggle)
                      ? '\u2714'
                      : '\u2715'
                )
              : '\u2205'
          }
          &nbsp;Luftdaten
        </button>
        <button
          className={ircelineIsReachable
            ? ''
            : 'unreachable'}
          onClick={() => this.props.onChangeDataOrigin({
            luftdaten: luftdatenToggle,
            irceline: !ircelineToggle
          })}>
          {
            (ircelineIsReachable)
              ? ((ircelineIsUpdating)
                  ? '\u231B'
                  : (ircelineToggle)
                      ? '\u2714'
                      : '\u2715'
                )
              : '\u2205'
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
    luftdatenIsReachable: state.stationUpdates.isReachable.luftdaten,
    ircelineIsReachable: state.stationUpdates.isReachable.irceline,
    luftdatenIsUpdating: state.stationUpdates.isUpdating.luftdaten,
    ircelineIsUpdating: state.stationUpdates.isUpdating.irceline
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
