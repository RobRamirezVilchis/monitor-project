export interface FileDetails {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly file?: File;
  meta?: any;
}

