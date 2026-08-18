import type { SummitContent } from "../content";

export interface ContentRepository {
  getSummitContent(): Promise<SummitContent>;
}
