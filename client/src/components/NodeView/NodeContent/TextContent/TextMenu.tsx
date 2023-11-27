import { Editor } from "@tiptap/react";
import "./TextMenu.scss";

interface IEditorProps {
  editor: Editor | null;
  onSave: () => void;
}

export const TextMenu = (props: IEditorProps) => {
  const { editor, onSave } = props;
  if (!editor) {
    return null;
  }

  // TODO: Add a menu of buttons for your text editor here
  return (
    <div id="textMenu">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          "textEditorButton" +
          (editor.isActive("bold") ? " activeTextEditorButton" : "")
        }
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={
          "textEditorButton" +
          (editor.isActive("italic") ? " activeTextEditorButton" : "")
        }
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        disabled={!editor.can().chain().focus().toggleHighlight().run()}
        className={
          "textEditorButton" +
          (editor.isActive("highlight") ? " activeTextEditorButton" : "")
        }
      >
        Highlight
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={
          "textEditorButton" +
          (editor.isActive("underline") ? " activeTextEditorButton" : "")
        }
      >
        Underline
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={
          "textEditorButton" +
          (editor.isActive("code") ? " activeTextEditorButton" : "")
        }
      >
        Code
      </button>
      <button className={"textEditorButton"} onClick={onSave}>
        Save Changes
      </button>
    </div>
  );
};
