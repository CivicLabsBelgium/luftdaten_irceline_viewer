import React, { Component } from 'react'
import { connect } from 'react-redux'

class Gradient extends Component {
  render () {
    const nodeSize = 50
    const currentPhenomenonMeta = this.props.phenomenonMeta[this.props.phenomenon]
    const height = (currentPhenomenonMeta.data.length - 1) * nodeSize + 1

    const showSolidColor = (this.props.phenomenon.indexOf('PM') > -1)
    let gradient = ''
    if (showSolidColor) {
      gradient = `linear-gradient(to top ${ currentPhenomenonMeta.data.map((pair, index) => index > 0 ? currentPhenomenonMeta.data[index].color + ' ' + ((index - 1) * nodeSize) + 'px, ' + currentPhenomenonMeta.data[index].color + ' ' + (index * nodeSize) + 'px' : '').join(', ')})`
    } else {
      gradient = ['linear-gradient(to top'].concat(
        currentPhenomenonMeta.data.map((pair, index) => pair.color + ' ' + (index * nodeSize) + 'px')
      ).join(', ').concat(')')
    }
    

    const gradientStyle = {
      height: height + 'px',
      background: gradient
    }

    const limitBarExceedsIndex = currentPhenomenonMeta.data.indexOf(
      (currentPhenomenonMeta.data.find(
        (data) => {
          return data.value >= currentPhenomenonMeta.max
        }
      ) || currentPhenomenonMeta.data[currentPhenomenonMeta.values.length - 1].value))

    const limitBarPos = (limitBarExceedsIndex === 0) ? 0 : (
      (nodeSize * limitBarExceedsIndex) -
      (nodeSize / (currentPhenomenonMeta.data[limitBarExceedsIndex].value - currentPhenomenonMeta.data[limitBarExceedsIndex - 1].value)) *
      (currentPhenomenonMeta.data[limitBarExceedsIndex].value - currentPhenomenonMeta.max)
    )

    const limitBarStyle = {
      bottom: limitBarPos - 1 + 'px'
    }

    return (
      <div style={{position: 'relative'}}>
        <div className="color-gradient" style={gradientStyle}>
          <div className="limit-bar" style={limitBarStyle}/>

          {
            currentPhenomenonMeta.data.map(
              (data, index) => {
                const labelBottom = (index * nodeSize - 10) + 'px'

                const labelStyle = {
                  bottom: labelBottom
                }

                return <div key={index} className="labelValue" style={labelStyle}>{data.value}</div>
              }
            )
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    phenomenon: state.appState.phenomenon,
    phenomenonMeta: state.appState.phenomenonMeta
  }
}

export default connect(mapStateToProps)(Gradient)
