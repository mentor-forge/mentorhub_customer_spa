<template>
  <v-container data-automation-id="profile-view-page">
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Profile</h1>
      </v-col>
    </v-row>

    <v-row v-if="!profileId">
      <v-col cols="12" md="8">
        <v-alert type="info" variant="tonal">
          No profile ID found.
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="profile">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <AutoSaveField
              :model-value="profile.name"
              label="Name *"
              :rules="[rules.required, rules.namePattern]"
              hint="No whitespace, max 40 characters"
              :on-save="(value: string | number) => updateField('name', String(value))"
              automation-id="profile-view-name-input"
            />

            <AutoSaveField
              :model-value="profile.description || ''"
              label="Description"
              :rules="[rules.descriptionPattern]"
              hint="Max 255 characters, no tabs or newlines"
              :on-save="(value: string | number) => updateField('description', String(value))"
              class="mt-4"
              textarea
              :rows="3"
              automation-id="profile-view-description-input"
            />

            <v-text-field
              :model-value="profile.status || 'N/A'"
              label="Status"
              readonly
              variant="outlined"
              class="mt-4"
              data-automation-id="profile-view-status-input"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { AutoSaveField, validationRules, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import { getStoredProfileId } from '@/composables/useAuth'
import type { ProfileUpdate } from '@/api/types'

const routeLocation = useRoute()
const queryClient = useQueryClient()

const profileId = computed(() => (routeLocation.params.id as string) || getStoredProfileId())

const { data: profile, isLoading, error: queryError } = useQuery({
  queryKey: ['profile', profileId],
  queryFn: () => (profileId.value ? api.getProfile(profileId.value) : Promise.reject(new Error('No profile ID'))),
  enabled: computed(() => Boolean(profileId.value)),
})

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const rules = {
  required: validationRules.required,
  namePattern: validationRules.namePattern,
  descriptionPattern: validationRules.descriptionPattern,
}

const { mutateAsync } = useMutation({
  mutationFn: (data: ProfileUpdate) => {
    if (!profileId.value) throw new Error('No profile ID')
    return api.updateProfile(profileId.value, data)
  },
  onSuccess: (updatedProfile) => {
    queryClient.setQueryData(['profile', profileId], updatedProfile)
  },
  onError: (err) => {
    errorRef.value = err as Error
  },
})

async function updateField(field: keyof ProfileUpdate, value: string) {
  if (!profileId.value) return
  await mutateAsync({ [field]: value })
}
</script>
