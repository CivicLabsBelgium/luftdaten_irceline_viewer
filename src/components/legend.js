import React from 'react'
import Gradient from './gradient'
import { connect } from 'react-redux'

//destructured props parameter
const Legend = ({phenomenonMeta, phenomenon}) =>
  <div title={phenomenonMeta[phenomenon].name} className="legend">
    <div className="unit">
      {
        phenomenonMeta[phenomenon].unit
      }
    </div>

    <div style={{position: 'relative'}}>
      <Gradient/>
    </div>
  </div>

const mapStateToProps = state => {
  return {
    phenomenon: state.appState.phenomenon,
    phenomenonMeta: state.appState.phenomenonMeta
  }
}

export default connect(mapStateToProps)(Legend)