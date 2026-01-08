import React, { useState } from 'react';
import { Form, ButtonGroup, Button } from 'react-bootstrap';
import './RichTextEditor.css';

const RichTextEditor = ({ value = '', onChange, placeholder = 'Enter description...', className = '' }) => {
  const [isPreview, setIsPreview] = useState(false);

  const insertText = (before, after = '') => {
    const textarea = document.getElementById('rich-text-area');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    // Reset selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 10);
  };

  const formatButtons = [
    { label: 'H1', action: () => insertText('# '), tooltip: 'Heading 1' },
    { label: 'H2', action: () => insertText('## '), tooltip: 'Heading 2' },
    { label: 'H3', action: () => insertText('### '), tooltip: 'Heading 3' },
    { label: 'B', action: () => insertText('**', '**'), tooltip: 'Bold', style: { fontWeight: 'bold' } },
    { label: 'I', action: () => insertText('*', '*'), tooltip: 'Italic', style: { fontStyle: 'italic' } },
    { label: 'List', action: () => insertText('• '), tooltip: 'Bullet Point' },
    { label: 'Quote', action: () => insertText('> '), tooltip: 'Quote' },
  ];

  const renderPreview = (text) => {
    if (!text) return placeholder;
    
    return text
      .replace(/### (.*$)/gm, '<h3>$1</h3>')
      .replace(/## (.*$)/gm, '<h2>$1</h2>')
      .replace(/# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^• (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="editor-toolbar">
        <ButtonGroup size="sm" className="format-buttons">
          {formatButtons.map((btn, index) => (
            <Button
              key={index}
              variant="outline-secondary"
              onClick={btn.action}
              title={btn.tooltip}
              style={btn.style}
              className="format-btn"
            >
              {btn.label}
            </Button>
          ))}
        </ButtonGroup>
        <ButtonGroup size="sm" className="view-toggle">
          <Button
            variant={!isPreview ? "primary" : "outline-primary"}
            onClick={() => setIsPreview(false)}
          >
            Edit
          </Button>
          <Button
            variant={isPreview ? "primary" : "outline-primary"}
            onClick={() => setIsPreview(true)}
          >
            Preview
          </Button>
        </ButtonGroup>
      </div>
      
      {!isPreview ? (
        <Form.Control
          as="textarea"
          id="rich-text-area"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="editor-textarea"
          rows={6}
        />
      ) : (
        <div
          className="editor-preview"
          dangerouslySetInnerHTML={{
            __html: renderPreview(value)
          }}
        />
      )}
      
      {!isPreview && (
        <div className="editor-help">
          <small className="text-muted">
            Use markdown formatting: # Heading, **bold**, *italic*, > quote, • bullet
          </small>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;