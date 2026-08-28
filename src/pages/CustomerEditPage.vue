<template>
  <v-container data-automation-id="customer-edit-page">
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Customer</h1>
      </v-col>
    </v-row>

    <v-row v-if="!customerId">
      <v-col cols="12" md="8">
        <v-alert type="info" variant="tonal">
          No customer ID found in access token.
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="customer">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-text-field
              :model-value="customer.name"
              label="Name"
              readonly
              variant="outlined"
              data-automation-id="customer-edit-name-input"
            />

            <v-textarea
              :model-value="customer.description || 'N/A'"
              label="Description"
              readonly
              variant="outlined"
              rows="3"
              class="mt-4"
              data-automation-id="customer-edit-description-input"
            />

            <v-text-field
              :model-value="customer.status || 'N/A'"
              label="Status"
              readonly
              variant="outlined"
              class="mt-4"
              data-automation-id="customer-edit-status-input"
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
import { useQuery } from '@tanstack/vue-query'
import { useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import { getStoredCustomerId } from '@/composables/useAuth'

const customerId = computed(() => getStoredCustomerId())

const { data: customer, isLoading, error: queryError } = useQuery({
  queryKey: ['customer', customerId],
  queryFn: () => (customerId.value ? api.getCustomer(customerId.value) : Promise.reject(new Error('No customer ID'))),
  enabled: computed(() => Boolean(customerId.value)),
})

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)
</script>
