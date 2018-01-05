import { Component } from 'react'
import { connect } from 'react-redux'
import { setDataOrigin } from '../redux/appState/actions'

class DataOriginPicker extends Component {
  render () {
    const luftdaten_toggle = this.props.dataOrigin.luftdaten
    const irceline_toggle = this.props.dataOrigin.irceline

    return (
      <div className="data-origin-picker">
        <span>filter</span>
        <button onClick={ () => this.props.onChangeDataOrigin({luftdaten: !luftdaten_toggle, irceline: irceline_toggle})}>{(luftdaten_toggle) ? '\u2714' : '\u2715'} Luftdaten</button>
        <button onClick={ () => this.props.onChangeDataOrigin({luftdaten: luftdaten_toggle, irceline: !irceline_toggle})}>{(irceline_toggle) ? '\u2714' : '\u2715'} Irceline</button>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    dataOrigin: state.appState.dataOrigin
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
