import React from 'react'
import Gradient from './gradient'
import { connect } from 'react-redux'

const Legend = (props) =>
      <div title={props.phenomenonMeta[props.phenomenon].name} className="legend">
        <div className="unit">
          {
            props.phenomenonMeta[props.phenomenon].unit
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