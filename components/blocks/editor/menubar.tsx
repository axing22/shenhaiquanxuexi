import { useCurrentEditor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Code2,
  Quote,
  Minus,
  CornerDownLeft,
  Undo2,
  Redo2,
  Palette,
  Eraser,
} from "lucide-react";

export default function Menubar() {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b mb-4">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("bold") ? "bg-gray-100" : ""
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("italic") ? "bg-gray-100" : ""
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("strike") ? "bg-gray-100" : ""
        }`}
        title="Strike"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("code") ? "bg-gray-100" : ""
        }`}
        title="Code"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="Clear marks"
      >
        <Eraser className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("paragraph") ? "bg-gray-100" : ""
        }`}
        title="Paragraph"
      >
        <Type className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 1 }) ? "bg-gray-100" : ""
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 3 }) ? "bg-gray-100" : ""
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 4 }) ? "bg-gray-100" : ""
        }`}
        title="Heading 4"
      >
        <Heading4 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 5 }) ? "bg-gray-100" : ""
        }`}
        title="Heading 5"
      >
        <Heading5 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 6 }) ? "bg-gray-100" : ""
        }`}
        title="Heading 6"
      >
        <Heading6 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("bulletList") ? "bg-gray-100" : ""
        }`}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("orderedList") ? "bg-gray-100" : ""
        }`}
        title="Ordered list"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("codeBlock") ? "bg-gray-100" : ""
        }`}
        title="Code block"
      >
        <Code2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("blockquote") ? "bg-gray-100" : ""
        }`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="Horizontal rule"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="Hard break"
      >
        <CornerDownLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setColor("#958DF1").run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("textStyle", { color: "#958DF1" })
            ? "bg-gray-100"
            : ""
        }`}
        title="Purple"
      >
        <Palette className="w-4 h-4" />
      </button>
    </div>
  );
}
