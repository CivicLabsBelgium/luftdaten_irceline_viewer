import React, { Component } from 'react'
import Gradient from './gradient'
import { connect } from 'react-redux'

class Legend extends Component {

  render () {

    return (
      <div title={this.props.phenomenonMeta[this.props.phenomenon].name} className="legend">
        <div className="unit">
          {
            this.props.phenomenonMeta[this.props.phenomenon].unit
          }
        </div>

        <div style={{position: 'relative'}}>
          <Gradient/>
        </div>
      </div>
    )
  }
}





const legendStateToProps = state => {
  return {
    phenomenon: state.appState.phenomenon,
    phenomenonMeta: state.appState.phenomenonMeta
  }
}

export default connect(legendStateToProps)(Legend)