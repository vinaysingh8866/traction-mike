
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
          <JsonEditorVue v-bind="jsonEditorSettings" v-model="jsonData" :onChange="handleJsonChange" style="height: 65vh;" />
        </div>
      </div>
      <div class="resizer vertical" @mousedown="e => startResize(e, 'vertical')"></div>
      <!-- Right Panel -->
      <div class="workflow-card">
        <div class="top" ref="topRightPane">
          <div v-for="(state,stateID) in states" :key="stateID">
             {{ console.log(`WorkflowEditor: Looping through state ${stateID}:`, JSON.stringify(state, null, 2)) }}
             {{ console.log(`WorkflowEditor: Passing display_data for state ${stateID}:`, JSON.stringify(state.display_data, null, 2)) }} 
             <WorkflowCard :data="state.display_data"/>
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

  console.log("WorkflowEditor: Initial jsonData:", JSON.stringify(jsonData, null, 2));

  const states = ref<State[]>(jsonData.states as State[]);

  console.log("WorkflowEditor: Initial states ref:", JSON.stringify(states.value, null, 2));

  // Method to handle changes from the JSON editor via :onChange prop
  const handleJsonChange = (newJson: any) => {
    console.log("WorkflowEditor: JSON editor content changed (onChange event).");
    // IMPORTANT: Ensure the editor doesn't cause an infinite loop.
    // If the editor itself reacts to `jsonData` changes, updating `jsonData` here might trigger the onChange again.
    // It seems `v-model` should handle the update, so we might not need to manually update `jsonData` here.
    // However, if v-model wasn't working, you might need:
    // try {
    //   // Be cautious with updating the reactive object directly in the change handler
    //   // jsonData = reactive(newJson); // This might break reactivity or cause loops
    //   // Object.assign(jsonData, newJson); // Also potentially problematic
    // } catch (e) {
    //   console.error("Error updating jsonData in onChange", e);
    // }
  };

  watch(jsonData, (newValue, oldValue) => {
    // Using deep watcher JUST to log editor changes.
    // We are NOT updating states.value here anymore.
    try { 
       console.log("WorkflowEditor: JSON editor content changed (deep watcher).");
       // Optionally log the new value if needed for debugging:
       // console.log("WorkflowEditor: New JSON data:", JSON.stringify(newValue, null, 2));
    } catch (error) { console.error("Error in deep jsonData watcher:", error); }
  }, { deep: true });
  
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
    // Create a clean, non-proxied copy of the current data
    let dataToSave;
    try {
      dataToSave = JSON.parse(JSON.stringify(jsonData));
    } catch (error) {
      console.error('Error creating clean data copy for saving:', error);
      toast.error('Error preparing data for saving: Invalid JSON format.');
      return; // Stop if data is not valid JSON
    }

    // Removed: Object.assign(jsonData,newData) - This was likely causing the error
    console.log("update:", update);
    console.log("Saving data:", JSON.stringify(dataToSave, null, 2)); // Log the data being sent

    try {      
        if (webhookUrl ) {
          const endpoint = update ? `${webhookUrl}/workflow/update-workflow` : `${webhookUrl}/workflow/set-workflow`;
          const method = update ? 'PUT' : 'POST'; // Use PUT for update, POST for create
          
          console.log(`Sending request to ${endpoint} with method ${method}`);
          /* const response = await fetch(endpoint, { 
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave), // Use the clean data copy
          });
          if (!response.ok) {
            const errorBody = await response.text(); // Read error response body
            console.error('Network response was not ok:', response.status, errorBody);
            throw new Error(`Network response was not ok: ${response.status} ${errorBody}`);
          } */
          const successMessage = update ? "Workflow Updated Successfully" : "Workflow Created Successfully";
          toast.success(successMessage);
          console.log(update ? "Workflow Data Updated:" : "Workflow Data Saved:", dataToSave);
        } else {
          console.error('Webhook URL is missing, cannot save.');
          toast.error('Cannot save workflow: Webhook URL is missing.');
        }
    } catch (error) {
        console.error('Error saving workflow:', error);
         toast.error(`Error saving workflow: ${error}`);
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
  