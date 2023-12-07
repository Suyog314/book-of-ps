import { Editor } from "@tiptap/react";
import "./TextMenu.scss";
import * as ri from "react-icons/ri";

interface IEditorProps {
  editor: Editor | null;
  save: () => Promise<void>;
}

export const TextMenu = (props: IEditorProps) => {
  const { editor, save } = props;
  if (!editor) {
    return null;
  }

  //helper to toggle highlight when clicked/unclicked
  const toggleHighlight = () => {
    if (editor.isActive("highlight")) {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().toggleHighlight({ color: "#FFFFFF" }).run();
    }
  };

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
        onClick={toggleHighlight}
        className={
          "textEditorButton" +
          (editor.isActive("highlight") ? " activeTextEditorButton" : "")
        }
      >
        Highlight
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={
          "textEditorButton" +
          (editor.isActive("underline") ? " activeTextEditorButton" : "")
        }
      >
        Underline
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          "textEditorButton" +
          (editor.isActive("bulletList") ? "activeTextEditorButton" : "")
        }
      >
        Bullet
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={"align-button"}
      >
        <ri.RiAlignLeft />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={"align-button"}
      >
        <ri.RiAlignCenter />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={"align-button"}
      >
        <ri.RiAlignRight />
      </button>

      <button onClick={save} className="save-button">
        Save
      </button>
    </div>
  );
};
