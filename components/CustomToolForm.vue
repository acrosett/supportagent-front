<template>
    <div class="custom-tool-form">
        <MegaForm :formClass="CustomTool" v-model="formData" :fieldOverrides="fieldOverrides"
            :includeFields="includeFields" :actions="actions" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import MegaForm, { FieldOverride, OverrideRecord } from '~/components/MegaForm.vue'
import { type ChecklistOption } from '~/components/ChecklistInput.vue'
import { ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity';
import { CustomTool, CustomToolArgument, HttpMethod, ArgumentLocation, ArgumentValueType, ArgumentDataType } from '~/eicrud_exports/services/SUPPORT-ms/custom-tool/custom-tool.entity'

const { t } = useI18n()

interface Props {
    tool?: CustomTool | null
}

const props = defineProps<Props>()
const emit = defineEmits(['save', 'cancel'])

// Form data
let formData = reactive<Record<string, any>>({
    name: '',
    description: '',
    url: '',
    method: HttpMethod.POST,
    arguments: [],
    contentType: 'application/json',
    timeoutMs: 30000,
    enabled: true,
    clientPriorities: []
})

// Include fields for CustomTool
const includeFields = [
    'name',
    'description',
    'url',
    'method',
    'arguments',
    'contentType',
    'timeoutMs',
    'enabled',
    'clientPriorities',
    'provideToolToGuests'
]

// Watch for tool prop changes
watch(() => props.tool, (newTool) => {
    if (newTool) {
        Object.assign(formData, {
            ...newTool,
            arguments: newTool.arguments || []
        })
    } else {
        // Reset form for new tool
        Object.assign(formData, {
            name: '',
            description: '',
            url: '',
            method: HttpMethod.POST,
            arguments: [],
            contentType: 'application/json',
            timeoutMs: 30000,
            enabled: true,
            clientPriorities: []
        })
    }
}, { immediate: true })

// Field overrides
const fieldOverrides: OverrideRecord<CustomTool, CustomToolArgument> = {
    clientPriorities: {
        type: 'checklist',
        isArray: false,
        description: t('customTools.form.clientPriorities.description'),
        props: {
            options: [
                { label: t('customTools.form.clientPriorities.lowest'), value: ClientPriority.LOWEST },
                { label: t('customTools.form.clientPriorities.regular'), value: ClientPriority.REGULAR },
                { label: t('customTools.form.clientPriorities.high'), value: ClientPriority.HIGH },
            ] as ChecklistOption[]
        }
    },
    name: {
        label: t('customTools.form.name.label'),
        placeholder: t('customTools.form.name.placeholder'),
        description: t('customTools.form.name.description')
    },
    description: {
        maxChars: 2000,
        type: 'richtext',
        label: t('customTools.form.description.label'),
        placeholder: t('customTools.form.description.placeholder'),
        description: t('customTools.form.description.description')
    },
    url: {
        label: t('customTools.form.url.label'),
        placeholder: t('customTools.form.url.placeholder'),
        description: t('customTools.form.url.description')
    },
    method: {
        type: 'select',
        label: t('customTools.form.method.label'),
        selectOptions: [
            { label: 'GET', value: HttpMethod.GET },
            { label: 'POST', value: HttpMethod.POST },
            { label: 'PUT', value: HttpMethod.PUT },
            { label: 'PATCH', value: HttpMethod.PATCH },
            { label: 'DELETE', value: HttpMethod.DELETE },
            { label: 'HEAD', value: HttpMethod.HEAD },
            { label: 'OPTIONS', value: HttpMethod.OPTIONS }
        ],
        description: t('customTools.form.method.description')
    },
    arguments: {
        isArray: true,
        nestedClass: CustomToolArgument,
        nestedIncludeFields: [
            'name',
            'description',
            'location',
            'valueType',
            'dataType',
            'constantValue',
            'required',
            'defaultValue',
        ],
        nestedFieldOverrides: {
            name: {
                label: t('customTools.form.arguments.name.label'),
                placeholder: t('customTools.form.arguments.name.placeholder'),
                description: t('customTools.form.arguments.name.description')
            },
            description: {
                maxChars: 2000,
                label: t('customTools.form.arguments.paramDescription.label'),
                placeholder: t('customTools.form.arguments.paramDescription.placeholder'),
                description: t('customTools.form.arguments.paramDescription.description')
            },
            location: {
                type: 'select',
                label: t('customTools.form.arguments.location.label'),
                selectOptions: [
                    { label: t('customTools.form.arguments.location.payload'), value: ArgumentLocation.PAYLOAD },
                    { label: t('customTools.form.arguments.location.header'), value: ArgumentLocation.HEADER },
                    { label: t('customTools.form.arguments.location.urlParam'), value: ArgumentLocation.URL_PARAM },
                    { label: t('customTools.form.arguments.location.queryParam'), value: ArgumentLocation.QUERY_PARAM }
                ],
                description: t('customTools.form.arguments.location.description')
            },
            valueType: {
                type: 'select',
                label: t('customTools.form.arguments.valueType.label'),
                selectOptions: [
                    { label: t('customTools.form.arguments.valueType.setByAi'), value: ArgumentValueType.SET_BY_AI },
                    { label: t('customTools.form.arguments.valueType.userId'), value: ArgumentValueType.USER_ID },
                    { label: t('customTools.form.arguments.valueType.sharedSecret'), value: ArgumentValueType.SHARED_SECRET },
                    { label: t('customTools.form.arguments.valueType.constant'), value: ArgumentValueType.CONSTANT }
                ],
                conditionsFieldsIfValue: [
                    { field: 'constantValue', values: [ArgumentValueType.CONSTANT] },
                    { field: 'defaultValue', values: [ArgumentValueType.SET_BY_AI] },
                    { field: 'required', values: [ArgumentValueType.SET_BY_AI] },
                    { field: 'description', values: [ArgumentValueType.SET_BY_AI] },
                ],
                description: t('customTools.form.arguments.valueType.description')
            },
            dataType: {
                type: 'select',
                label: t('customTools.form.arguments.dataType.label'),
                selectOptions: [
                    { label: t('customTools.form.arguments.dataType.string'), value: ArgumentDataType.STRING },
                    { label: t('customTools.form.arguments.dataType.number'), value: ArgumentDataType.NUMBER },
                    { label: t('customTools.form.arguments.dataType.boolean'), value: ArgumentDataType.BOOLEAN },
                    { label: t('customTools.form.arguments.dataType.object'), value: ArgumentDataType.OBJECT },
                    { label: t('customTools.form.arguments.dataType.array'), value: ArgumentDataType.ARRAY }
                ],
                description: t('customTools.form.arguments.dataType.description')
            },
            constantValue: {
                label: t('customTools.form.arguments.constantValue.label'),
                placeholder: t('customTools.form.arguments.constantValue.placeholder'),
                description: t('customTools.form.arguments.constantValue.description'),
                // Show only when valueType is CONSTANT
            },
            required: {
                type: 'checkbox',
                label: t('customTools.form.arguments.required.label'),
                description: t('customTools.form.arguments.required.description')
            },
            defaultValue: {
                label: t('customTools.form.arguments.defaultValue.label'),
                placeholder: t('customTools.form.arguments.defaultValue.placeholder'),
                description: t('customTools.form.arguments.defaultValue.description')
            }
        },
        label: t('customTools.form.arguments.label'),
        description: t('customTools.form.arguments.description')
    },
    contentType: {
        label: t('customTools.form.contentType.label'),
        placeholder: t('customTools.form.contentType.placeholder'),
        description: t('customTools.form.contentType.description')
    },
    timeoutMs: {
        type: 'number',
        label: t('customTools.form.timeout.label'),
        placeholder: t('customTools.form.timeout.placeholder'),
        description: t('customTools.form.timeout.description')
    },
    enabled: {
        type: 'checkbox',
        label: t('customTools.form.enabled.label'),
        description: t('customTools.form.enabled.description')
    },
    provideToolToGuests: {
        type: 'checkbox',
        label: t('customTools.form.guestAccess.label'),
        description: t('customTools.form.guestAccess.description')
    }
}

// Form actions
const actions = computed(() => [
    {
        label: t('customTools.form.actions.cancel'),
        callback: handleCancel,
        color: 'secondary' as const,
        margin: 'right' as const,
        skipValidation: true
    },
    {
        margin: 'left' as const,
        label: props.tool ? t('customTools.form.actions.update') : t('customTools.form.actions.create'),
        callback: handleSave,
        color: 'primary' as const
    }
])

// Handlers
async function handleSave(data: any) {
    try {
        const toolData = {
            ...data
        }
        emit('save', toolData)
    } catch (error) {
        console.error('Error saving tool:', error)
        throw error
    }
}

async function handleCancel() {
    emit('cancel')
}
</script>

<style lang="scss" scoped>
@use "~/assets/_variables.scss" as *;

.custom-tool-form {
    max-width: 800px;
    margin: 0 auto;

    // Enhance nested form styling for arguments
    :deep(.megaform-nested-array-item) {
        background: rgba($panel, 0.8);
        border-color: rgba($muted, 0.3);

        .megaform-nested-title {
            color: $brand;
            font-weight: 600;
        }
    }

    // Style parameter sections
    :deep(.megaform-field) {
        &:has([name="arguments"]) {
            .megaform-label {
                font-size: 1.1em;
                font-weight: 600;
                color: $brand;
            }
        }
    }

    // Enhanced spacing for nested forms
    :deep(.megaform-nested) {
        .megaform-field {
            margin-bottom: 1.2em;
        }

        .megaform-input,
        .megaform-select {
            font-size: 0.95em;
        }
    }
}
</style>