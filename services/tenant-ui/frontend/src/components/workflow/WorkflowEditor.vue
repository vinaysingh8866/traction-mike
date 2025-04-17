
  <template>
    <div class="header">
      <Button label="Back" icon="pi pi-angle-left" class="pi-button" @click="$emit('back')" />
      <h2>{{ workflow ? 'Edit Workflow' : 'Create New Workflow' }}</h2>
    </div>
    <div class="json-panel-container">
      <!-- Left Panel -->
      <div class="json-panel" ref="leftPane">
        <div class="toolbar">
          <span class="title">{{jsonData.name}}</span>
        </div>
  
        <div class="json-editor">
          <JsonEditorVue v-bind="jsonEditorSettings" v-model="jsonData" style="height: 65vh;" />
        </div>
      </div>
      <div class="resizer vertical" @mousedown="e => startResize(e, 'vertical')"></div>
      <!-- Right Panel -->
      <div class="workflow-card">
        <div class="top" ref="topRightPane">
          <div v-for="(state,stateID) in states" :key="stateID">
             <WorkflowCard :data="state.displayData"/>
             <div class="spacer" style="height:1px"></div>
           </div>
        </div>
        <div class="resizer horizontal" @mousedown="e => startResize(e, 'horizontal')"></div>
        <div class="bottom" ref="bottomRightPane">
          <Button label="Refresh" icon="pi pi-refresh" class="pi-button" @click="refresh" />
          <Button label="Save" icon="pi pi-save" class="pi-button" @click="save" />
        </div>
      </div>

  </div>
  </template>
  
  <script setup lang="ts">
  import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import JsonEditorVue from "json-editor-vue";
  import WorkflowCard from "@/components/workflow/WorkflowRender.vue";
  import Button from "primevue/button";
  import { Workflow,State } from "@/types/workflow";
  import { defineEmits } from "vue";
  import { useToast } from "vue-toastification";
  const emit = defineEmits(['back']);
  const toast = useToast();
  const {workflow,webhookUrl,update} = defineProps({
    workflow: {
      type: Object as () => Workflow,
      required: true,
    },
    webhookUrl: {
      type: String,
    },
    update:{
      type: Boolean,
    }
  });

  console.log("inside WorkflowEditor: ",workflow);

  const jsonEditorSettings = {
  mainMenuBar: true,
  mode: 'text' as any,
  statusBar: true,
  navigationBar: true,
  indentation: 2,
  tabSize: 2,
  };
  let jsonData = reactive<Workflow>(workflow);

  
  const states = ref<State[]>(jsonData.states as State[]);

  console.log("States : ",states.value);

  watch(jsonData, (newValue) => {
    try { Object.assign(jsonData,newValue) } catch (error) { console.error("Invalid JSON:", error); }
  });
  
  const leftPane = ref<HTMLElement|null>(null)
  const topRightPane = ref<HTMLElement|null>(null)
  const bottomRightPane = ref<HTMLElement|null>(null)

  let isResizing = false
  let isVertical = true
  let scrollState = { top: 0, left: 0 }

  const LEFT_WIDTH_KEY = 'leftPaneWidth'
  const TOP_RIGHT_HEIGHT_KEY = 'topRightPaneHeight'

  function startResize(e: MouseEvent, direction: 'vertical' | 'horizontal') {
    isResizing = true
    isVertical = direction === 'vertical'

    const targetPane = isVertical ? leftPane.value : topRightPane.value
    if (targetPane) {
      scrollState.left = targetPane.scrollLeft
      scrollState.top = targetPane.scrollTop
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopResize)
  }

  function handleMouseMove(e:MouseEvent) {
  if (!isResizing) return

  if (isVertical && leftPane.value) {
    const newWidth = e.clientX
    leftPane.value.style.flexBasis = `${newWidth}px`
    localStorage.setItem(LEFT_WIDTH_KEY, newWidth.toString())

    leftPane.value.scrollLeft = scrollState.left
    leftPane.value.scrollTop = scrollState.top
  } else if (!isVertical && topRightPane.value) {
    const containerTop = topRightPane.value.parentElement?.getBoundingClientRect().top || 0
    const newHeight = e.clientY - containerTop
    topRightPane.value.style.flexBasis = `${newHeight}px`
    localStorage.setItem(TOP_RIGHT_HEIGHT_KEY, newHeight.toString())

    topRightPane.value.scrollLeft = scrollState.left
    topRightPane.value.scrollTop = scrollState.top
  }
  }

  function stopResize() {
    isResizing = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopResize)
  }

  onMounted(() => {
    // Restore dimensions from localStorage
    const leftWidth = localStorage.getItem(LEFT_WIDTH_KEY)
    if (leftWidth && leftPane.value) {
      leftPane.value.style.flexBasis = `${leftWidth}px`
    }

    const topHeight = localStorage.getItem(TOP_RIGHT_HEIGHT_KEY)
    if (topHeight && topRightPane.value) {
      topRightPane.value.style.flexBasis = `${topHeight}px`
    }
  })

  onBeforeUnmount(() => stopResize())

  const refresh = () => {
    const newData = JSON.parse(JSON.stringify(jsonData)); // Update the reactive `jsonData` to trigger re-render
    Object.assign(jsonData,newData)
    console.log("WorkflowCard refreshed with new data:", newData);
  }

  const save = async () => {
    const newData = JSON.parse(JSON.stringify(jsonData)); // Update the reactive `jsonData` to trigger re-render
    Object.assign(jsonData,newData)
    console.log("update:", update);
    try {      
        if (webhookUrl ) {
          if(update){
            /* const response = await fetch(`${webhookUrl}/workflow/update-workflow`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.parse(JSON.stringify(newData)),
            });
            if (!response.ok) {
              throw new Error('Network response was not ok');
            } */
           toast.success("Workflow Updated Successfully");
           console.log("Workflow Data Updated with new data:", newData);
          } else {
            /* const response = await fetch(`${webhookUrl}/workflow/set-workflow`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.parse(JSON.stringify(newData)),
            });
            if (!response.ok) {
              throw new Error('Network response was not ok');
            } */
           toast.success("Workflow Created Successfully");
           console.log("Workflow Data Saved with new data:", newData);
          }
        /* const response = await fetch(`${webhookUrl}/workflow/set-workflows`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        } */
        
        }
    } catch (error) {
        console.error('Error updating workflow:', error);
         toast.error('Error updating workflow'+error);
    };
  }
    
  watch(
  () => jsonData.name,
  (newVal) => {
    console.log('Workflow name changed:', newVal)
  }
  )

  </script>
  
  <style scoped>
  .header {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .json-panel-container {
    display: flex;
    gap: 10px;
    justify-content: center;
    background: #f4f4f9;
    padding: 1% 0;
  }


  .json-panel {
    flex-basis: 300px;
    overflow: auto;
    background: #6666CC;
    border-radius: 3px 0 0 3px;
    color: white;
    box-sizing: border-box;
    position: relative;
    height: 100%;
    width: 70%;
    margin: 0 auto;
  }

  .json-editor {
    background: white;
    color: black;
    max-height: 100%;
    max-width: 100%;
    border-radius: 3px;
    --jse-theme-color: #6666ccea;
    --jse-theme-color-highlight: #5a5ab0;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0 8px 8px;
  }

  .workflow-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    background: #f4f4f9;
    
  }

  .top {
    padding:10px;
    overflow: auto;
    background: #f4f4f9;
    border-radius: 0 4px 0 0
  }

  .bottom {
    display: flex;
    overflow: auto;
    background: #f4f4f9;
    border-radius: 0 0 4px;
    gap: 10px;
    padding: 20px;
    justify-content: space-evenly;
  }

  .title {
    font-size: 18px;
    font-weight: bold;
  }

  .actions {
    display: flex;
    gap: 5px;
  }

  .editor-tabs {
    margin-top: 10px;
  }

  .editor-tabs button {
    background: transparent;
    border: none;
    color: white;
    padding: 5px 10px;
    cursor: pointer;
  }

  .editor-tabs button.active {
    font-weight: bold;
    border-bottom: 2px solid white;
  }

  .resizer {
    background: #aaa;
    z-index: 10;
  }

  .resizer.vertical {
    width: 5px;
    cursor: col-resize;
  }

  .resizer.horizontal {
    height: 5px;
    cursor: row-resize;
  }



  .json-textarea {
    width: 100%;
    height: 200px;
    font-family: monospace;
    border: none;
    outline: none;
  }


</style>
  