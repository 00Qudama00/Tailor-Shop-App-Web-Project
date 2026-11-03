import { useRef, useState } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AudioRecorder({ value, onRecorded, onClear }) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        onRecorded(blob);
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      toast.error('Microphone permission is needed to record.');
    }
  }

  function stop() {
    recorderRef.current.stop();
    setRecording(false);
  }

  return (
    <div className="recorder">
      {!recording && (
        <button type="button" className="btn btn-outline btn-sm" onClick={start}>
          <Mic size={15} /> {value ? 'Record again' : 'Record voice note'}
        </button>
      )}
      {recording && (
        <button type="button" className="btn btn-danger btn-sm" onClick={stop}>
          <span className="rec-dot" /> <Square size={14} /> Stop
        </button>
      )}
      {value && !recording && (
        <>
          <audio src={value} controls style={{ height: 36 }} />
          <button type="button" className="icon-btn danger" onClick={onClear} title="Remove">
            <Trash2 size={16} />
          </button>
        </>
      )}
    </div>
  );
}
