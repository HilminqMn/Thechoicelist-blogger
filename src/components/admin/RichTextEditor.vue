<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-slate-900 underline' },
    }),
    Placeholder.configure({
      placeholder: 'เริ่มเขียนเนื้อหาบทความ...',
    }),
  ],
  editorProps: {
    attributes: {
      class:
        'prose-editor min-h-[280px] px-4 py-3 text-sm text-slate-900 focus:outline-none',
    },
  },
  onUpdate: ({ editor: ed }) => {
    emit('update:modelValue', ed.getHTML());
  },
});

watch(
  () => props.modelValue,
  (value) => {
    const ed = editor.value;
    if (!ed) return;
    const current = ed.getHTML();
    if (value !== current) {
      ed.commands.setContent(value || '', false);
    }
  },
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

function setLink() {
  const ed = editor.value;
  if (!ed) return;

  const previous = ed.getAttributes('link').href as string | undefined;
  const url = window.prompt('URL ลิงก์', previous ?? 'https://');

  if (url === null) return;
  if (url === '') {
    ed.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5"
    >
      <button
        type="button"
        title="ตัวหนา"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
        :class="{ 'bg-slate-200 text-slate-900': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <span class="font-bold">B</span>
      </button>
      <button
        type="button"
        title="ตัวเอียง"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
        :class="{ 'bg-slate-200 text-slate-900': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <span class="italic">I</span>
      </button>

      <span class="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

      <button
        type="button"
        title="หัวข้อ H2"
        class="inline-flex h-8 items-center justify-center rounded-md px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
        :class="{ 'bg-slate-200 text-slate-900': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>

      <span class="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

      <button
        type="button"
        title="รายการแบบจุด"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
        :class="{ 'bg-slate-200 text-slate-900': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <button
        type="button"
        title="รายการแบบตัวเลข"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
        :class="{ 'bg-slate-200 text-slate-900': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="10" y1="6" x2="21" y2="6" />
          <line x1="10" y1="12" x2="21" y2="12" />
          <line x1="10" y1="18" x2="21" y2="18" />
          <text x="2" y="8" fill="currentColor" stroke="none" font-size="7" font-weight="bold">1</text>
          <text x="2" y="14" fill="currentColor" stroke="none" font-size="7" font-weight="bold">2</text>
          <text x="2" y="20" fill="currentColor" stroke="none" font-size="7" font-weight="bold">3</text>
        </svg>
      </button>

      <span class="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

      <button
        type="button"
        title="แทรกลิงก์"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
        :class="{ 'bg-slate-200 text-slate-900': editor.isActive('link') }"
        @click="setLink"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
    </div>

    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
:deep(.ProseMirror) {
  min-height: 280px;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  pointer-events: none;
  float: left;
  height: 0;
  color: #94a3b8;
  content: attr(data-placeholder);
}

:deep(.prose-editor h2) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

:deep(.prose-editor h3) {
  margin-top: 0.75rem;
  margin-bottom: 0.375rem;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

:deep(.prose-editor ul) {
  margin: 0.5rem 0;
  list-style-type: disc;
  padding-left: 1.5rem;
}

:deep(.prose-editor ol) {
  margin: 0.5rem 0;
  list-style-type: decimal;
  padding-left: 1.5rem;
}

:deep(.prose-editor p) {
  margin: 0.5rem 0;
  line-height: 1.625;
}

:deep(.prose-editor a) {
  color: #0f172a;
  text-decoration: underline;
  text-decoration-color: #cbd5e1;
  text-underline-offset: 2px;
}
</style>
