import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import { GlobalState } from 'src/store/types';
import { getCaretIndex, isFirefox, updateCaret, insertNodeAtCaret, getSelection } from '../../../../../../utils/contentEditable';
import { MoodSVGIcon, SendSVGIcon } from "@react-md/material-icons";
import './style.scss';

const brRegex = /<br>/g;

type Props = {
  placeholder: string;
  disabledInput: boolean;
  autofocus: boolean;
  sendMessage: (event: any) => void;
  buttonAlt: string;
  onPressEmoji: () => void;
  onTextInputChange?: (event: any) => void;
};

function Sender({ sendMessage, placeholder, disabledInput, autofocus, onTextInputChange, buttonAlt, onPressEmoji }: Props, ref) {
  const showChat = useSelector((state: GlobalState) => state.behavior.showChat);
  const inputRef = useRef<HTMLDivElement>(null!);
  const refContainer = useRef<HTMLDivElement>(null);
  const [enter, setEnter] = useState(false);
  const [firefox, setFirefox] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (showChat && autofocus) inputRef.current?.focus();
  }, [showChat]);

  useEffect(() => {
    setFirefox(isFirefox());
  }, []);

  useEffect(() => {
    if (!disabledInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabledInput]);

  useImperativeHandle(ref, () => ({
    onSelectEmoji: handlerOnSelectEmoji,
  }));

  const checkIfEmpty = () => {
    setIsEmpty(!inputRef.current?.innerText.trim());
  };

  const handlerOnChange = (event) => {
    checkIfEmpty();
    onTextInputChange && onTextInputChange(event);
  };

  const handlerSendMessage = () => {
    const el = inputRef.current;
    if (el.innerHTML) {
      sendMessage(el.innerText);
      el.innerHTML = '';
      setIsEmpty(true);
    }
  };

  const handlerOnSelectEmoji = (emoji) => {
    const el = inputRef.current;
    const { start, end } = getSelection(el);
    if (el.innerHTML) {
      const firstPart = el.innerHTML.substring(0, start);
      const secondPart = el.innerHTML.substring(end);
      el.innerHTML = `${firstPart}${emoji.emoji}${secondPart}`;
    } else {
      el.innerHTML = emoji.emoji;
    }
    updateCaret(el, start, emoji.emoji.length);
    checkIfEmpty();
  };

  const handlerOnKeyPress = (event) => {
    const el = inputRef.current;
    if (event.charCode == 13 && !event.shiftKey) {
      event.preventDefault();
      handlerSendMessage();
    }
    if (event.charCode === 13 && event.shiftKey) {
      event.preventDefault();
      insertNodeAtCaret(el);
      setEnter(true);
    }
  };

  const handlerOnKeyUp = (event) => {
    const el = inputRef.current;
    if (!el) return true;
    if (firefox && event.key === 'Backspace') {
      if (el.innerHTML.length === 1 && enter) {
        el.innerHTML = '';
        setEnter(false);
      } else if (brRegex.test(el.innerHTML)) {
        el.innerHTML = el.innerHTML.replace(brRegex, '');
      }
    }
    checkIfEmpty();
  };

  const handlerOnKeyDown = (event) => {
    const el = inputRef.current;
    if (event.key === 'Backspace' && el) {
      const caretPosition = getCaretIndex(inputRef.current);
      const character = el.innerHTML.charAt(caretPosition - 1);
      if (character === "\n") {
        event.preventDefault();
        event.stopPropagation();
        el.innerHTML = el.innerHTML.substring(0, caretPosition - 1) + el.innerHTML.substring(caretPosition);
        updateCaret(el, caretPosition, -1);
      }
    }
  };

  const handlerPressEmoji = () => {
    onPressEmoji();
  };

  return (
    <>
      <div ref={refContainer} className="rcw-sender">
        <div className='rcw-sender-divider'></div>
        <div className={cn('rcw-new-message', { 'rcw-message-disable': disabledInput })}>
          <div
            spellCheck
            className="rcw-input"
            role="textbox"
            contentEditable={!disabledInput}
            ref={inputRef}
            onInput={handlerOnChange}
            onKeyPress={handlerOnKeyPress}
            onKeyUp={handlerOnKeyUp}
            onKeyDown={handlerOnKeyDown}
          />
          {isEmpty && (
            <div
              className="placeholder"
              style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                color: '#aaa',
                pointerEvents: 'none',
              }}
            >
              {placeholder}
            </div>
          )}
        </div>
        <div className='rcw-sender-buttons'>
          <button className='rcw-picker-btn' type="submit" onClick={handlerPressEmoji}>
            <MoodSVGIcon className="rcw-picker-icon" />
          </button>
          <button type="submit" className="rcw-send" onClick={handlerSendMessage}>
            <SendSVGIcon className="rcw-send-icon" />
          </button>
        </div>
      </div>
    </>
  );
}

export default forwardRef(Sender);
