const STATUS_INITIAL = 'initial';
const STATUS_ASKING_PERMISSION = 'askingPermission';
const STATUS_WAITING = 'waiting';
const STATUS_RECOGNIZING = 'recognizing';
const STATUS_FINISHED = 'finished';
const STATUS_ERROR = 'error';

type QueryChangeListener = (query: string) => void;
type StateChangeListener = () => void;

export type VoiceListeningState = {
  status: string;
  transcript?: string;
  isSpeechFinal?: boolean;
  errorCode?: string;
};

export type ToggleListening = () => void;

export default function voiceSearchHelper() {
  const SpeechRecognitionAPI: new () => SpeechRecognition =
    (window as any).webkitSpeechRecognition ||
    (window as any).SpeechRecognition;
  const getDefaultState = (status: string): VoiceListeningState => ({
    status,
    transcript: undefined,
    isSpeechFinal: undefined,
    errorCode: undefined,
  });
  let state: VoiceListeningState = getDefaultState(STATUS_INITIAL);
  let recognition: SpeechRecognition | undefined;
  let searchAsYouSpeak: boolean = false;
  let onQueryChange: QueryChangeListener = () => {};
  let onStateChange: StateChangeListener = () => {};

  const setOnQueryChange = (queryChangeListener: QueryChangeListener) => {
    onQueryChange = queryChangeListener;
  };
  const setOnStateChange = (stateChangeListener: StateChangeListener) => {
    onStateChange = stateChangeListener;
  };
  const setSearchAsYouSpeak = (value: boolean) => {
    searchAsYouSpeak = value;
  };

  const isBrowserSupported = () => Boolean(SpeechRecognitionAPI);

  const isListening = () =>
    state.status === STATUS_ASKING_PERMISSION ||
    state.status === STATUS_WAITING ||
    state.status === STATUS_RECOGNIZING;

  const setState = (newState = {}) => {
    state = { ...state, ...newState };
    onStateChange();
  };

  const getState = (): VoiceListeningState => state;

  const resetState = (status = STATUS_INITIAL) => {
    setState(getDefaultState(status));
  };

  const stop = () => {
    if (recognition) {
      recognition.stop();
      recognition = undefined;
    }
    resetState();
  };

  const start = () => {
    recognition = new SpeechRecognitionAPI();
    if (!recognition) {
      return;
    }
    resetState(STATUS_ASKING_PERMISSION);
    recognition.interimResults = true;
    recognition.onstart = () => {
      setState({
        status: STATUS_WAITING,
      });
    };
    recognition.onerror = (event: SpeechRecognitionError) => {
      setState({ status: STATUS_ERROR, errorCode: event.error });
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setState({
        status: STATUS_RECOGNIZING,
        transcript:
          event.results[0] &&
          event.results[0][0] &&
          event.results[0][0].transcript,
        isSpeechFinal: event.results[0] && event.results[0].isFinal,
      });
      if (searchAsYouSpeak && state.transcript) {
        onQueryChange(state.transcript);
      }
    };
    recognition.onend = () => {
      if (!state.errorCode && state.transcript && !searchAsYouSpeak) {
        onQueryChange(state.transcript);
      }
      if (state.status !== STATUS_ERROR) {
        setState({ status: STATUS_FINISHED });
      }
    };

    recognition.start();
  };

  const toggleListening = () => {
    if (!isBrowserSupported()) {
      return;
    }
    if (isListening()) {
      stop();
    } else {
      start();
    }
  };

  return {
    setOnQueryChange,
    setOnStateChange,
    setSearchAsYouSpeak,
    getState,
    isBrowserSupported,
    isListening,
    toggleListening,
  };
}