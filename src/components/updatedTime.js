import React, { Component } from 'react'
import { connect } from 'react-redux'


class UpdatedTime extends Component {

  render() {
    return (
      <div className="updated-time" style={{display: (this.props.time !== null ) ? 'flex' : 'none' }}>Last updated at {this.props.time}</div>
    )
  }
}


const updatedTimeStateToProps = state => {
  return {
    time: state.appState.time
  }
}


export default connect(updatedTimeStateToProps)(UpdatedTime)