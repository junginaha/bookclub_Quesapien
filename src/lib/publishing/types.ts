export type BookStatus = '집필중' | '편집중' | '검수중' | '출판완료';
export type PageSize = 'A5' | '신국판' | '국판';
export type ImageWidthType = 'body' | 'full' | 'thumb' | 'large';
export type ExportType = 'pdf' | 'epub';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type FileType = 'docx' | 'txt' | 'md';

export interface PublishingBook {
  id: string;
  user_id: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher: string;
  isbn?: string;
  publish_date?: string;
  price?: number;
  copyright_text?: string;
  publisher_bio?: string;
  status: BookStatus;
  cover_url?: string;
  back_cover_url?: string;
  page_size: PageSize;
  created_at: string;
  updated_at: string;
}

export interface PublishingManuscript {
  id: string;
  book_id: string;
  file_name: string;
  file_url: string;
  file_type: FileType;
  raw_content?: string;
  parsed_at?: string;
  created_at: string;
}

export interface PublishingChapter {
  id: string;
  book_id: string;
  parent_id?: string;
  level: number;
  order_index: number;
  title: string;
  content?: string;
  page_number?: number;
  children?: PublishingChapter[];
}

export interface PublishingLayout {
  id: string;
  book_id: string;
  margin_top: number;
  margin_bottom: number;
  margin_inner: number;
  margin_outer: number;
  body_font: string;
  heading_font: string;
  body_font_size: number;
  line_height: number;
  image_default_width: ImageWidthType;
  header_enabled: boolean;
  header_text: string;
  footer_enabled: boolean;
  page_number_pos: string;
}

export interface PublishingImage {
  id: string;
  book_id: string;
  chapter_id?: string;
  file_name: string;
  file_url: string;
  caption?: string;
  alt_text?: string;
  width_type: ImageWidthType;
  order_index: number;
}

export interface PublishingExport {
  id: string;
  book_id: string;
  export_type: ExportType;
  status: ExportStatus;
  file_url?: string;
  page_count?: number;
  file_size_kb?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// Page size dimensions in mm
export const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  'A5': { width: 148, height: 210 },
  '신국판': { width: 153, height: 225 },
  '국판': { width: 148, height: 210 },
};

export const STATUS_LABELS: Record<BookStatus, { label: string; color: string }> = {
  '집필중': { label: '집필중', color: 'blue' },
  '편집중': { label: '편집중', color: 'yellow' },
  '검수중': { label: '검수중', color: 'orange' },
  '출판완료': { label: '출판완료', color: 'green' },
};
