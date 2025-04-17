export interface Workflow {
    name: string;
    workflowId: string;
    formatVersion: string;
    initialState: string;
    render: RenderItem[];
    states: State[];
  }
  
  export interface RenderItem {
    stylesID: string;
    type: string;
    styles: Style;
  }
  
  export interface Style {
    fontType: string;
    textColor: string;
    backgroundColor: string;
  }
  
  export interface State {
    stateID: string;
    displayData: DisplayDataItem[];
    transitions: Transition[];
    actions: Record<string, any>[];
  }
  
  export type DisplayDataItem = ImageData | TitleData | TextData | ButtonData;
  
  export interface ImageData {
    type: "image";
    url: string;
  }
  
  export interface TitleData {
    type: "title";
    text: string;
  }
  
  export interface TextData {
    type: "text";
    text: string;
  }
  
  export interface ButtonData {
    type: "button";
    actionID: string;
    label: string;
  }
  
  export interface Transition {
    actionID: string;
    type: string;
    value: string;
    condition: string;
  }
  