import React, { useState } from 'react';
import { getSavedNickname, saveNickname, submitScore, SubmitScoreResponse } from '../../../entities/ranking';
import './SubmitScoreForm.css';

interface SubmitScoreFormProps {
  timeSeconds: number;
  churu: number;
  onSubmitted?: (result: SubmitScoreResponse) => void;
}

const MAX_NICKNAME = 12;

export const SubmitScoreForm: React.FC<SubmitScoreFormProps> = ({ timeSeconds, churu, onSubmitted }) => {
  const [nickname, setNickname] = useState(getSavedNickname);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setStatus('error');
      setMessage('닉네임을 입력해 주세요.');
      return;
    }
    setStatus('loading');
    setMessage(null);
    try {
      const result = await submitScore({ nickname: trimmed, timeSeconds, churu });
      saveNickname(trimmed);
      setStatus('done');
      setMessage(
        result.improved
          ? `등록 완료! 현재 ${result.rank}위예요.`
          : `기존 기록이 더 좋아서 유지했어요. 현재 ${result.rank}위예요.`,
      );
      onSubmitted?.(result);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : '등록에 실패했어요.');
    }
  };

  if (status === 'done') {
    return <p className="submit-score-message submit-score-message--ok">🏅 {message}</p>;
  }

  return (
    <form className="submit-score-form" onSubmit={handleSubmit}>
      <div className="submit-score-row">
        <input
          className="submit-score-input"
          type="text"
          value={nickname}
          maxLength={MAX_NICKNAME}
          placeholder="닉네임 (최대 12자)"
          onChange={(e) => setNickname(e.target.value)}
          disabled={status === 'loading'}
          autoComplete="off"
          aria-label="닉네임"
        />
        <button className="btn btn-primary submit-score-button" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '등록 중…' : '랭킹 등록'}
        </button>
      </div>
      {message && <p className="submit-score-message submit-score-message--error">{message}</p>}
    </form>
  );
};
