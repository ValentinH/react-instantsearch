import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import VoiceSearch from '../VoiceSearch';

Enzyme.configure({ adapter: new Adapter() });

const defaultProps = {
  isBrowserSupported: true,
  isListening: false,
  toggleListening: () => {},
  voiceListeningState: {
    status: 'initial',
    transcript: undefined,
    isSpeechFinal: undefined,
    errorCode: undefined,
  },
};

describe('VoiceSearch', () => {
  describe('button', () => {
    it('calls toggleListening when button is clicked', () => {
      const props = {
        ...defaultProps,
        toggleListening: jest.fn(),
      };
      const wrapper = mount(<VoiceSearch {...props} />);
      wrapper.find('button').simulate('click');
      expect(props.toggleListening).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rendering', () => {
    it('with default props', () => {
      const wrapper = shallow(<VoiceSearch {...defaultProps} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('with custom component for button with isListening: false', () => {
      const customButton = ({ isListening }) => (
        <button>{isListening ? 'Stop' : 'Start'}</button>
      );

      const wrapper = shallow(
        <VoiceSearch {...defaultProps} buttonComponent={customButton} />
      );
      expect(wrapper).toMatchSnapshot();
    });

    it('with custom component for button with isListening: true', () => {
      const customButton = ({ isListening }) => (
        <button>{isListening ? 'Stop' : 'Start'}</button>
      );

      const props = {
        ...defaultProps,
        isListening: true,
        voiceListeningState: {
          status: 'recognizing',
          transcript: undefined,
          isSpeechFinal: undefined,
          errorCode: undefined,
        },
      };

      const wrapper = shallow(
        <VoiceSearch {...props} buttonComponent={customButton} />
      );
      expect(wrapper).toMatchSnapshot();
    });

    it('with custom template for status', () => {
      const customStatus = ({
        status,
        errorCode,
        isListening,
        transcript,
        isSpeechFinal,
        isBrowserSupported,
      }) => (
        <div>
          <p>status: {status}</p>
          <p>errorCode: {errorCode}</p>
          <p>isListening: {isListening}</p>
          <p>transcript: {transcript}</p>
          <p>isSpeechFinal: {isSpeechFinal}</p>
          <p>isBrowserSupported: {isBrowserSupported}</p>
        </div>
      );

      const props = {
        ...defaultProps,
        isListening: true,
        voiceListeningState: {
          status: 'recognizing',
          transcript: 'Hello',
          isSpeechFinal: false,
          errorCode: undefined,
        },
      };

      const wrapper = shallow(
        <VoiceSearch {...props} statusComponent={customStatus} />
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});