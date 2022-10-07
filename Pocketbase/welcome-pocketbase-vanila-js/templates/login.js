export default `
<div style="position:relative; width: 40rem; margin: 20rem auto auto;">
  <bx-tile class="dds-theme-zone-white">
    <h4 style="padding: 0 0 1rem 0;">Login</h4>
    <bx-form-item class="dds-theme-zone-g10">
      <bx-input size="sm" id="inpEmail" required="true">
        <span slot="label-text">Email:</span>
        <span id="inpEmailMessage" slot="validity-message"></span>
      </bx-input>
    </bx-form-item>
    <div style="height: 0.5rem;"></div>
    <bx-form-item class="dds-theme-zone-g10">
      <bx-input size="sm" id="inpPass" required="true">
        <span slot="label-text">Password:</span>
      </bx-input>
    </bx-form-item>
    <div style="height: 1rem;"></div>
    <bx-btn id="btnSubmit">Submit</bx-btn>
  </bx-tile>
</div>
`;
