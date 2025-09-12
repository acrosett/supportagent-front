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

interface Props {
    tool?: CustomTool | null
}

const props = defineProps<Props>()
const emit = defineEmits(['save', 'cancel'])

// Form data
const formData = reactive<Record<string, any>>({
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
    'clientPriorities'
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
const fieldOverrides: OverrideRecord<CustomTool> = {
    clientPriorities: {
        type: 'checklist',
        isArray: false,
        description: 'Which clients can benefit from this tool?',
        props: {
            options: [
                { label: "Lowest priority", value: ClientPriority.LOWEST },
                { label: "Regular priority", value: ClientPriority.REGULAR },
                { label: "High priority", value: ClientPriority.HIGH },
            ] as ChecklistOption[]
        }
    },
    name: {
        label: 'Tool Name',
        placeholder: 'e.g., get-user-data',
        description: 'Unique name for this tool (lowercase, no spaces)'
    },
    description: {
        type: 'richtext',
        label: 'Description',
        placeholder: 'Describe what this tool does...',
        description: 'Detailed description of the tool\'s purpose and functionality'
    },
    url: {
        label: 'Endpoint URL',
        placeholder: 'https://api.example.com/test/{argumentName}',
        description: 'The full URL where the tool will make requests'
    },
    method: {
        type: 'select',
        label: 'HTTP Method',
        selectOptions: [
            { label: 'GET', value: HttpMethod.GET },
            { label: 'POST', value: HttpMethod.POST },
            { label: 'PUT', value: HttpMethod.PUT },
            { label: 'PATCH', value: HttpMethod.PATCH },
            { label: 'DELETE', value: HttpMethod.DELETE },
            { label: 'HEAD', value: HttpMethod.HEAD },
            { label: 'OPTIONS', value: HttpMethod.OPTIONS }
        ],
        description: 'HTTP method to use for requests'
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
                label: 'Parameter Name',
                placeholder: 'e.g., user_id',
                description: 'Name of the parameter as expected by the API'
            },
            description: {
                label: 'Description',
                placeholder: 'Describe this parameter...',
                description: 'What this parameter is used for'
            },
            location: {
                type: 'select',
                label: 'Location',
                selectOptions: [
                    { label: 'Request Body (Payload)', value: ArgumentLocation.PAYLOAD },
                    { label: 'HTTP Header', value: ArgumentLocation.HEADER },
                    { label: 'URL Parameter', value: ArgumentLocation.URL_PARAM },
                    { label: 'Query Parameter', value: ArgumentLocation.QUERY_PARAM }
                ],
                description: 'Where this parameter should be placed in the request'
            },
            valueType: {
                type: 'select',
                label: 'Value Type',
                selectOptions: [
                    { label: 'Set by AI', value: ArgumentValueType.SET_BY_AI },
                    { label: 'User ID', value: ArgumentValueType.USER_ID },
                    { label: 'Shared Secret', value: ArgumentValueType.SHARED_SECRET },
                    { label: 'Constant Value', value: ArgumentValueType.CONSTANT }
                ],
                description: 'How the parameter value should be determined'
            },
            dataType: {
                type: 'select',
                label: 'Data Type',
                selectOptions: [
                    { label: 'String', value: ArgumentDataType.STRING },
                    { label: 'Number', value: ArgumentDataType.NUMBER },
                    { label: 'Boolean', value: ArgumentDataType.BOOLEAN },
                    { label: 'Object', value: ArgumentDataType.OBJECT },
                    { label: 'Array', value: ArgumentDataType.ARRAY }
                ],
                description: 'The data type of this parameter'
            },
            constantValue: {
                label: 'Constant Value',
                placeholder: 'Enter fixed value...',
                description: 'Fixed value to use (only for constant value type)',
                conditionsFields: ['valueType'],
                // Show only when valueType is CONSTANT
                titleColor: () => {
                    const arg = formData.arguments?.find((arg: any) => arg.valueType === ArgumentValueType.CONSTANT)
                    return arg ? undefined : '#999'
                }
            },
            required: {
                type: 'checkbox',
                label: 'Required Parameter',
                description: 'Whether this parameter must be provided'
            },
            defaultValue: {
                label: 'Default Value',
                placeholder: 'Default value if not provided...',
                description: 'Default value to use when parameter is not required'
            }
        },
        label: 'Parameters',
        description: 'Define the parameters this tool accepts'
    },
    contentType: {
        label: 'Content Type',
        placeholder: 'application/json',
        description: 'MIME type for request body'
    },
    timeoutMs: {
        type: 'number',
        label: 'Timeout (ms)',
        placeholder: '30000',
        description: 'Request timeout in milliseconds'
    },
    enabled: {
        type: 'checkbox',
        label: 'Tool Status',
        description: 'Whether this tool is available for use'
    }
}

// Form actions
const actions = computed(() => [
    {
        label: 'Cancel',
        callback: handleCancel,
        color: 'secondary' as const,
        margin: 'right' as const,
        skipValidation: true
    },
    {
        margin: 'left' as const,
        label: props.tool ? 'Update Tool' : 'Create Tool',
        callback: handleSave,
        color: 'primary' as const
    }
])

// Handlers
async function handleSave(data: any) {
    try {
        const toolData = {
            ...data,
            id: props.tool?.id || undefined
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