import React, { useEffect, useRef } from "react";
import { useLiveEditor } from "@/components/live-editor/LiveEditorProvider";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  id: string;
  children: React.ReactNode;
  element?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  id, 
  children, 
  element: Element = "span",
  className 
}) => {
  const { editMode, getTextDraft, setTextDraft } = useLiveEditor();
  const ref = useRef<HTMLElement>(null);

  // Sync drafts with visual content
  useEffect(() => {
    if (!ref.current || editMode) return;
    const draft = getTextDraft(id, "");
    if (draft && ref.current.innerText !== draft) {
      ref.current.innerText = draft;
    }
  }, [editMode, getTextDraft, id]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const text = (e.currentTarget as HTMLElement).innerText;
    setTextDraft(id, text);
  };

  return React.createElement(
    Element,
    {
      ref,
      className: cn(
        className,
        editMode && "outline-dashed outline-1 outline-primary/50 rounded px-1 cursor-text"
      ),
      contentEditable: editMode,
      suppressContentEditableWarning: true,
      "data-editable-text-id": id,
      onInput: handleInput,
    },
    children
  );
};