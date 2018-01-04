import React from 'react'
import { connect } from 'react-redux'


const UpdatedTime = ({time}) =>
  <div className="updated-time">{(time === null ) ? 'Updating...' : 'Last updated '+ time}</div>




const mapStateToProps = state => {
  return {
    time: state.appState.time
  }
}


export default connect(mapStateToProps)(UpdatedTime)