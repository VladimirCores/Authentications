export default (userName) => `
<div style="position:relative; width: 80vh;">
  <div style="display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-content: stretch;
    align-items: flex-start;
  ">
    <div style="flex: 0 1 auto; align-self: auto; padding: 1rem; background-color: lightgray">
      <h3>User Logged In: <br> ${userName}</h3>
      <input id='inpUploadFile' type='file' accept="application/json" hidden/>
      <bx-btn id="btnAddBooks">Add Books</bx-btn>
    </div>
    <div style="flex: 0 1 auto; align-self: auto; padding: 1rem; background-color: lightblue">
      <h4>Books list:</h4>
      <bx-loading id="preloaderBooks" inactive style="display: none;"></bx-loading>
      <div id="booksContainer"></div>
    </div>
  </div>
</div>
 `;
