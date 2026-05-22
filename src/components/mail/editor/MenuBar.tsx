import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";

const menuButtonBase =
  "flex h-8 w-8 items-center justify-center rounded-md text-[#5f6368] transition-all hover:bg-[#e8eaed] hover:text-[#202124] disabled:opacity-40 disabled:hover:bg-transparent dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]";
const menuButtonActive =
  "!bg-[#1e2a4a] !text-white shadow-sm ring-1 ring-[#1e2a4a]/20 hover:!bg-[#0d1530] hover:!text-white dark:!bg-[#1e2a4a] dark:!text-white";
const preserveSelection = (e: React.MouseEvent) => {
  e.preventDefault();
};

const TipTapMenuBar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="flex flex-wrap gap-0.5">
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`${menuButtonBase} ${editor.isActive("bold") ? menuButtonActive : ""}`}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <Bold className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`${menuButtonBase} ${editor.isActive("italic") ? menuButtonActive : ""}`}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <Italic className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${menuButtonBase} ${editor.isActive("strike") ? menuButtonActive : ""}`}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`${menuButtonBase} ${editor.isActive("code") ? menuButtonActive : ""}`}
        title="Inline code"
        aria-label="Inline code"
      >
        <Code className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 1 }) ? menuButtonActive : ""}`}
        title="Heading 1"
        aria-label="Heading 1"
      >
        <Heading1 className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 2 }) ? menuButtonActive : ""}`}
        title="Heading 2"
        aria-label="Heading 2"
      >
        <Heading2 className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 3 }) ? menuButtonActive : ""}`}
        title="Heading 3"
        aria-label="Heading 3"
      >
        <Heading3 className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 4 }) ? menuButtonActive : ""}`}
        title="Heading 4"
        aria-label="Heading 4"
      >
        <Heading4 className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 5 }) ? menuButtonActive : ""}`}
        title="Heading 5"
        aria-label="Heading 5"
      >
        <Heading5 className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 6 }) ? menuButtonActive : ""}`}
        title="Heading 6"
        aria-label="Heading 6"
      >
        <Heading6 className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${menuButtonBase} ${editor.isActive("bulletList") ? menuButtonActive : ""}`}
        title="Bulleted list"
        aria-label="Bulleted list"
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${menuButtonBase} ${editor.isActive("orderedList") ? menuButtonActive : ""}`}
        title="Numbered list"
        aria-label="Numbered list"
      >
        <ListOrdered className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${menuButtonBase} ${editor.isActive("blockquote") ? menuButtonActive : ""}`}
        title="Blockquote"
        aria-label="Blockquote"
      >
        <Quote className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={menuButtonBase}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        <Undo className="size-4" />
      </button>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={menuButtonBase}
        title="Redo (Ctrl+Shift+Z)"
        aria-label="Redo"
      >
        <Redo className="size-4" />
      </button>
    </div>
  );
};

export default TipTapMenuBar;
