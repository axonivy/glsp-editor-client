/* eslint-disable max-len */
import { GIssueMarkerView } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import type { VNode } from 'snabbdom';
import { type SIssueSeverity, svg } from 'sprotty';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class IvyIssueMarkerView extends GIssueMarkerView {
  protected getGlspIssueMarkerBackground(severity: SIssueSeverity): VNode {
    switch (severity) {
      case 'warning':
        return <polygon class-sprotty-issue-background={true} points='8 0, 12 12, 0 12' />;
      case 'error':
      case 'info':
        return <circle class-sprotty-issue-background={true} r={this.radius} cx={this.radius} cy={this.radius} />;
    }
  }

  protected get radius(): number {
    return 6;
  }

  protected getGlspIssueMarkerPath(severity: SIssueSeverity): string {
    switch (severity) {
      // paths used here are svg versions of codicons, resized to 12px
      case 'error': // 'codicon-error'
        return 'M8 2.5C4.96243 2.5 2.5 4.96243 2.5 8C2.5 11.0376 4.96243 13.5 8 13.5C11.0376 13.5 13.5 11.0376 13.5 8C13.5 4.96243 11.0376 2.5 8 2.5ZM1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8Z M6.31311 6.3131C6.50838 6.11784 6.82496 6.11784 7.02022 6.3131L8 7.29288L8.97978 6.3131C9.17504 6.11784 9.49162 6.11784 9.68689 6.3131C9.88215 6.50837 9.88215 6.82495 9.68689 7.02021L8.70711 7.99999L9.68689 8.97977C9.88215 9.17503 9.88215 9.49161 9.68689 9.68688C9.49162 9.88214 9.17504 9.88214 8.97978 9.68688L8 8.7071L7.02022 9.68688C6.82496 9.88214 6.50838 9.88214 6.31311 9.68688C6.11785 9.49161 6.11785 9.17503 6.31311 8.97977L7.29289 7.99999L6.31311 7.02021C6.11785 6.82495 6.11785 6.50837 6.31311 6.3131Z';
      case 'warning': // 'codicon-warning'
        return 'M8.00706 6.52274C8.2832 6.52274 8.50706 6.7466 8.50706 7.02274V9.50001C8.50706 9.77615 8.2832 10 8.00706 10C7.73091 10 7.50706 9.77615 7.50706 9.50001V7.02274C7.50706 6.7466 7.73091 6.52274 8.00706 6.52274ZM8.00706 10.5243C8.2832 10.5243 8.50706 10.7482 8.50706 11.0243V11.031C8.50706 11.3071 8.2832 11.531 8.00706 11.531C7.73091 11.531 7.50706 11.3071 7.50706 11.031V11.0243C7.50706 10.7482 7.73091 10.5243 8.00706 10.5243Z M7.06898 2.75412C7.35117 2.58775 7.67277 2.5 8.00035 2.5C8.32793 2.5 8.64953 2.58775 8.93172 2.75412C9.21237 2.91958 9.44384 3.1568 9.60237 3.44136L14.3352 11.6072C14.347 11.6275 14.3573 11.6487 14.3662 11.6704C14.4784 11.9478 14.521 12.2484 14.4904 12.5461C14.4597 12.8437 14.3567 13.1293 14.1903 13.378C14.0239 13.6266 13.7992 13.8308 13.5358 13.9727C13.2724 14.1146 12.9782 14.1899 12.679 14.192L12.6755 14.192H3.33854C3.32627 14.192 3.31411 14.1916 3.30207 14.1907C3.28148 14.1922 3.26058 14.1924 3.23943 14.1913C2.9473 14.1763 2.663 14.0915 2.41028 13.9442C2.15756 13.7969 1.94375 13.5913 1.7867 13.3445C1.62965 13.0977 1.53392 12.8169 1.5075 12.5256C1.48107 12.2342 1.52473 11.9408 1.63481 11.6698C1.64356 11.6482 1.6538 11.6273 1.66546 11.6072L6.39833 3.44136C6.55686 3.1568 6.78833 2.91958 7.06898 2.75412ZM3.30172 13.1933C3.31388 13.1924 3.32616 13.192 3.33854 13.192H12.6736C12.8091 13.1908 12.9422 13.1566 13.0616 13.0923C13.1813 13.0278 13.2835 12.935 13.3592 12.8219C13.4348 12.7088 13.4817 12.5789 13.4956 12.4436C13.5085 12.3186 13.4929 12.1925 13.4503 12.0746L8.72989 3.93021C8.65777 3.79988 8.55216 3.6912 8.42385 3.61555C8.29553 3.5399 8.1493 3.5 8.00035 3.5C7.8514 3.5 7.70517 3.5399 7.57686 3.61555C7.44855 3.6912 7.34284 3.79983 7.27073 3.93017L7.26591 3.93888L2.55022 12.0749C2.50836 12.19 2.49232 12.313 2.50341 12.4352C2.51542 12.5677 2.55895 12.6954 2.63036 12.8076C2.70177 12.9198 2.79899 13.0133 2.9139 13.0803C3.02881 13.1473 3.15808 13.1858 3.29092 13.1927C3.29453 13.1928 3.29813 13.1931 3.30172 13.1933Z';
      case 'info': // 'codicon-info'
        return 'M 6.5719 0.013 A 5.9159 5.9159 90 0 1 10.2188 1.7695 A 6.1421 6.1421 90 0 1 10.619 9.9386 A 5.9594 5.9594 90 0 1 3.1546 11.4523 A 6.0899 6.0899 90 0 1 0.4402 8.4074 A 6.1943 6.1943 90 0 1 0.2401 4.3098 A 6.0899 6.0899 90 0 1 2.65 1.0126 A 5.9159 5.9159 90 0 1 6.5719 0.013 Z M 6.9825 11.1913 A 5.1242 5.1242 90 0 0 9.9491 9.3905 A 5.2808 5.2808 90 0 0 9.6011 2.3784 A 5.0633 5.0633 90 0 0 3.1372 1.7347 A 5.2721 5.2721 90 0 0 3.5722 10.6867 A 5.0546 5.0546 90 0 0 6.9825 11.1913 Z M 5.534 4.3359 H 6.6214 V 3.4659 H 5.534 Z M 6.6214 5.2059 V 8.6858 H 5.534 V 5.2059 Z';
    }
  }
}
