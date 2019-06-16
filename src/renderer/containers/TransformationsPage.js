import { connect } from 'react-redux';
import Transformations from '../components/Transformations';

const mapStateToProps = (state) => {
  return state;
};

export default connect(
  mapStateToProps
)(Transformations);
