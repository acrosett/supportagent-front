always reuse these components
AppButton.vue
AppIcon.vue

When a form is needed use
MegaForm.vue
use it with the includeFields option (not excludeFields)

When a confirmation dialog is needed use
nuxtApp.$confirmPopup

When a toast notification is needed use
nuxtApp.$toast

when api call, catch the error and pass the error object to the $toast function (it will determine the message automatically)

when making API call you will use nuxtApp.$sp.<service>.<method>
for exemple phoneNumber service dto for basic operations (find, create,delete batch) will be in the file phone-number.entity.ts

for non base operations (cmds) you will find a dto in <method>.dto.ts

No JSDoc ever.

Do the i18n extraction when a display string is needed, only update i18n/locales/en.json don't do other languages