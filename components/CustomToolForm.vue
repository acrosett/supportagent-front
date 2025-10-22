<template>
    <div class="custom-tool-form">
        <MegaForm :formClass="formData.publicToolId ? ExtendPublicToolDto : CustomTool" v-model="formData" :fieldOverrides="fieldOverrides"
            :includeFields="includeFields" :actions="actions" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import MegaForm, { FieldOverride, OverrideRecord } from '~/components/MegaForm.vue'
import { type ChecklistOption } from '~/components/ChecklistInput.vue'
import { ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity';
import { CustomTool, CustomToolArgument, HttpMethod, ArgumentLocation, ArgumentValueType, ArgumentDataType } from '~/eicrud_exports/services/SUPPORT-ms/custom-tool/custom-tool.entity'

import { useLocalNamespaceAsync } from '~/composables/useLocalNamespace'
import { ExtendPublicToolDto } from '~/eicrud_exports/services/SUPPORT-ms/custom-tool/cmds/extend_public_tool/extend_public_tool.dto';
const { t } = await useLocalNamespaceAsync('custom-tool-form')

interface Props {
    tool?: CustomTool | null
}

const props = defineProps<Props>()
const emit = defineEmits(['save', 'cancel'])

// Form data
let formData = reactive<Partial<CustomTool>>({
    name: '',
    description: '',
    url: '',
    method: HttpMethod.POST,
    arguments: [],
    contentType: 'application/json',
    timeoutMs: 30000,
    enabled: true,
    clientPriorities: [],
    publicToolId: null as any,
})

// Include fields for CustomTool - conditional based on extends
const includeFields = computed(() => {
    if (formData.publicToolId) {
        // For extended tools, only allow these fields to be modified
        return [
            'name',
            'description',
            'arguments',
            'clientPriorities',
            'provideToolToGuests'
        ]
    }
    
    return [
        'name',
        'description',
        'url',
        'method',
        'arguments',
        'contentType',
        'timeoutMs',
        'enabled',
        'clientPriorities',
        'provideToolToGuests',
        'resultValidityMin'
    ]
})

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
            clientPriorities: [],
            extends: null
        })
    }
}, { immediate: true })

// Field overrides - computed based on extends
const fieldOverrides = computed((): OverrideRecord<CustomTool, CustomToolArgument> => ({
    clientPriorities: {
        type: 'checklist',
        isArray: false,
        description: t('clientPriorities.description'),
        props: {
            options: [
                { label: t('clientPriorities.lowest'), value: ClientPriority.LOWEST },
                { label: t('clientPriorities.regular'), value: ClientPriority.REGULAR },
                { label: t('clientPriorities.high'), value: ClientPriority.HIGH },
            ] as ChecklistOption[]
        }
    },
    name: {
        label: t('name.label'),
        placeholder: t('name.placeholder'),
        description: t('name.description')
    },
    description: {
        maxChars: 2000,
        type: 'richtext',
        label: t('description.label'),
        placeholder: t('description.placeholder'),
        description: t('description.description')
    },
    url: {
        label: t('url.label'),
        placeholder: t('url.placeholder'),
        description: t('url.description')
    },
    method: {
        type: 'select',
        label: t('method.label'),
        selectOptions: [
            { label: 'GET', value: HttpMethod.GET },
            { label: 'POST', value: HttpMethod.POST },
            { label: 'PUT', value: HttpMethod.PUT },
            { label: 'PATCH', value: HttpMethod.PATCH },
            { label: 'DELETE', value: HttpMethod.DELETE },
            { label: 'HEAD', value: HttpMethod.HEAD },
            { label: 'OPTIONS', value: HttpMethod.OPTIONS }
        ],
        description: t('method.description')
    },
    arguments: {
        isArray: true,
        fixedArray: !!formData.publicToolId,
        nestedClass: CustomToolArgument,
        nestedIncludeFields: formData.publicToolId ? [
                'valueType',
                'constantValue',
                'defaultValue',
                'name',
                'description',
            ] : [
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
                props: {
                    disabled: !!formData.publicToolId
                },
                label: t('arguments.name.label'),
                placeholder: t('arguments.name.placeholder'),
                description: t('arguments.name.description')
            },
            description: {
                maxChars: 2000,
                label: t('arguments.paramDescription.label'),
                placeholder: t('arguments.paramDescription.placeholder'),
                description: t('arguments.paramDescription.description')
            },
            location: {
                type: 'select',
                label: t('arguments.location.label'),
                selectOptions: [
                    { label: t('arguments.location.payload'), value: ArgumentLocation.PAYLOAD },
                    { label: t('arguments.location.header'), value: ArgumentLocation.HEADER },
                    { label: t('arguments.location.urlParam'), value: ArgumentLocation.URL_PARAM },
                    { label: t('arguments.location.queryParam'), value: ArgumentLocation.QUERY_PARAM }
                ],
                description: t('arguments.location.description')
            },
            valueType: {
                type: 'select',
                label: t('arguments.valueType.label'),
                selectOptions: formData.publicToolId ? [
                    { label: t('arguments.valueType.setByAi'), value: ArgumentValueType.SET_BY_AI },
                    { label: t('arguments.valueType.constant'), value: ArgumentValueType.CONSTANT }
                ] : [
                    { label: t('arguments.valueType.setByAi'), value: ArgumentValueType.SET_BY_AI },
                    { label: t('arguments.valueType.userId'), value: ArgumentValueType.USER_ID },
                    { label: t('arguments.valueType.sharedSecret'), value: ArgumentValueType.SHARED_SECRET },
                    { label: t('arguments.valueType.constant'), value: ArgumentValueType.CONSTANT }
                ],
                conditionsFieldsIfValue: [
                    { field: 'constantValue', values: [ArgumentValueType.CONSTANT] },
                    { field: 'defaultValue', values: [ArgumentValueType.SET_BY_AI] },
                    { field: 'required', values: [ArgumentValueType.SET_BY_AI] },
                    { field: 'description', values: [ArgumentValueType.SET_BY_AI] },
                ],
                description: t('arguments.valueType.description')
            },
            dataType: {
                type: 'select',
                label: t('arguments.dataType.label'),
                selectOptions: [
                    { label: t('arguments.dataType.string'), value: ArgumentDataType.STRING },
                    { label: t('arguments.dataType.number'), value: ArgumentDataType.NUMBER },
                    { label: t('arguments.dataType.boolean'), value: ArgumentDataType.BOOLEAN },
                    { label: t('arguments.dataType.object'), value: ArgumentDataType.OBJECT },
                    { label: t('arguments.dataType.array'), value: ArgumentDataType.ARRAY }
                ],
                description: t('arguments.dataType.description')
            },
            constantValue: {
                label: t('arguments.constantValue.label'),
                placeholder: t('arguments.constantValue.placeholder'),
                description: t('arguments.constantValue.description'),
                // Show only when valueType is CONSTANT
            },
            required: {
                type: 'checkbox',
                label: t('arguments.required.label'),
                description: t('arguments.required.description')
            },
            defaultValue: {
                label: t('arguments.defaultValue.label'),
                placeholder: t('arguments.defaultValue.placeholder'),
                description: t('arguments.defaultValue.description')
            }
        },
        label: t('arguments.label'),
        description: t('arguments.description')
    },
    contentType: {
        label: t('contentType.label'),
        placeholder: t('contentType.placeholder'),
        description: t('contentType.description')
    },
    timeoutMs: {
        type: 'number',
        label: t('timeout.label'),
        placeholder: t('timeout.placeholder'),
        description: t('timeout.description')
    },
    enabled: {
        type: 'checkbox',
        label: t('enabled.label'),
        description: t('enabled.description')
    },
    provideToolToGuests: {
        type: 'checkbox',
        label: t('guestAccess.label'),
        description: t('guestAccess.description')
    }
}))

// Form actions
const actions = computed(() => [
    {
        label: t('actions.cancel'),
        callback: handleCancel,
        color: 'secondary' as const,
        margin: 'right' as const,
        skipValidation: true
    },
    {
        margin: 'left' as const,
        label: props.tool ? t('actions.update') : t('actions.create'),
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
