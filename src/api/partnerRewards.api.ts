// API для системы вознаграждений партнеров
import { baseApi } from './baseApi';

// Типы данных
export interface PartnerSupplierAgreement {
  id: number;
  partner_id: number;
  supplier_id: number;
  start_date: string;
  end_date?: string;
  commission_type: 'custom' | 'percentage' | 'fixed_amount';
  active: boolean;
  description?: string;
  display_name: string;
  duration_text: string;
  status_text: string;
  current: boolean;
  can_be_edited: boolean;
  reward_rules_count: number;
  active_reward_rules_count: number;
  created_at: string;
  updated_at: string;
}

export interface RewardRule {
  id: number;
  partner_supplier_agreement_id: number;
  rule_type: 'fixed_per_order' | 'percentage' | 'fixed_per_item';
  amount: number;
  conditions?: string;
  priority: number;
  active: boolean;
  description?: string;
  rule_type_display: string;
  amount_display: string;
  conditions_hash: Record<string, any>;
  conditions_description: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerReward {
  id: number;
  partner_id: number;
  supplier_id: number;
  reward_rule_id: number;
  tire_order_id?: number;
  order_id?: number;
  calculated_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  calculated_at: string;
  paid_at?: string;
  notes?: string;
  payment_status_display: string;
  formatted_amount: string;
  formatted_calculated_at: string;
  formatted_paid_at: string;
  order_type: string;
  order_number: string;
  order_amount: number;
  order_date: string;
  can_be_marked_as_paid: boolean;
  can_be_cancelled: boolean;
  is_pending: boolean;
  is_paid: boolean;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  firm_id: string;
  is_active: boolean;
  priority: number;
  sync_status: string;
  products_count: number;
  in_stock_products_count: number;
}

export interface RuleType {
  key: string;
  display: string;
  description: string;
}

export interface RewardStatistics {
  total_pending: number;
  total_paid: number;
  total_cancelled: number;
  current_month: number;
  total_agreements: number;
  active_suppliers: number;
}

export interface RewardPreview {
  rule_id: number;
  rule_type: string;
  rule_description: string;
  conditions: string;
  applicable: boolean;
  calculated_amount: number;
  test_data: Record<string, any>;
}

// Параметры для создания договоренности
export interface CreateAgreementData {
  supplier_id: number;
  start_date: string;
  end_date?: string;
  commission_type: string;
  active: boolean;
  description?: string;
}

// Параметры для создания правила
export interface CreateRuleData {
  rule_type: string;
  amount: number;
  priority: number;
  active: boolean;
  description?: string;
  conditions?: string;
}

// Параметры для обновления вознаграждения
export interface UpdateRewardData {
  notes?: string;
  payment_status?: string;
}

// API endpoints
export const partnerRewardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Договоренности партнер-поставщик
    getAgreements: builder.query<{ data: PartnerSupplierAgreement[] }, {
      active?: boolean;
      supplier_id?: number;
    }>({
      query: (params) => ({
        url: 'partner_supplier_agreements',
        params,
      }),
      providesTags: ['PartnerAgreement'],
    }),

    getAgreement: builder.query<{ data: PartnerSupplierAgreement }, number>({
      query: (id) => `partner_supplier_agreements/${id}`,
      providesTags: (result, error, id) => [{ type: 'PartnerAgreement', id }],
    }),

    createAgreement: builder.mutation<{ data: PartnerSupplierAgreement }, CreateAgreementData>({
      query: (data) => ({
        url: 'partner_supplier_agreements',
        method: 'POST',
        body: { partner_supplier_agreement: data },
      }),
      invalidatesTags: ['PartnerAgreement'],
    }),

    updateAgreement: builder.mutation<{ data: PartnerSupplierAgreement }, {
      id: number;
      data: Partial<CreateAgreementData>;
    }>({
      query: ({ id, data }) => ({
        url: `partner_supplier_agreements/${id}`,
        method: 'PATCH',
        body: { partner_supplier_agreement: data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PartnerAgreement', id }],
    }),

    deleteAgreement: builder.mutation<void, number>({
      query: (id) => ({
        url: `partner_supplier_agreements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PartnerAgreement'],
    }),

    getAvailableSuppliers: builder.query<{ data: Supplier[] }, void>({
      query: () => 'partner_supplier_agreements/available_suppliers',
      providesTags: ['Supplier'],
    }),

    // Правила вознаграждений
    getRules: builder.query<{ data: RewardRule[] }, {
      agreement_id: number;
      active?: boolean;
      rule_type?: string;
    }>({
      query: ({ agreement_id, ...params }) => ({
        url: `partner_supplier_agreements/${agreement_id}/reward_rules`,
        params,
      }),
      providesTags: ['RewardRule'],
    }),

    getRule: builder.query<{ data: RewardRule }, number>({
      query: (id) => `reward_rules/${id}`,
      providesTags: (result, error, id) => [{ type: 'RewardRule', id }],
    }),

    createRule: builder.mutation<{ data: RewardRule }, {
      agreement_id: number;
      data: CreateRuleData;
    }>({
      query: ({ agreement_id, data }) => ({
        url: `partner_supplier_agreements/${agreement_id}/reward_rules`,
        method: 'POST',
        body: { reward_rule: data },
      }),
      invalidatesTags: ['RewardRule'],
    }),

    updateRule: builder.mutation<{ data: RewardRule }, {
      id: number;
      data: Partial<CreateRuleData>;
    }>({
      query: ({ id, data }) => ({
        url: `reward_rules/${id}`,
        method: 'PATCH',
        body: { reward_rule: data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'RewardRule', id }],
    }),

    deleteRule: builder.mutation<void, number>({
      query: (id) => ({
        url: `reward_rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RewardRule'],
    }),

    previewRule: builder.mutation<RewardPreview, {
      id: number;
      testData: {
        total_amount?: number;
        items_count?: number;
        brands?: string[];
        diameters?: string[];
      };
    }>({
      query: ({ id, testData }) => ({
        url: `reward_rules/${id}/preview`,
        method: 'POST',
        params: testData,
      }),
    }),

    getRuleTypes: builder.query<{ rule_types: RuleType[] }, void>({
      query: () => 'reward_rules/rule_types',
    }),

    // Вознаграждения партнеров
    getRewards: builder.query<{
      partner_rewards: { data: PartnerReward[] };
      pagination: any;
      statistics: RewardStatistics;
    }, {
      status?: string;
      supplier_id?: number;
      date_from?: string;
      date_to?: string;
      page?: number;
      per_page?: number;
    }>({
      query: (params) => ({
        url: 'partner_rewards',
        params,
      }),
      providesTags: ['PartnerReward'],
    }),

    getReward: builder.query<{ data: PartnerReward }, number>({
      query: (id) => `partner_rewards/${id}`,
      providesTags: (result, error, id) => [{ type: 'PartnerReward', id }],
    }),

    updateReward: builder.mutation<{ data: PartnerReward }, {
      id: number;
      data: UpdateRewardData;
    }>({
      query: ({ id, data }) => ({
        url: `partner_rewards/${id}`,
        method: 'PATCH',
        body: { partner_reward: data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PartnerReward', id }],
    }),

    markRewardAsPaid: builder.mutation<{ data: PartnerReward }, {
      id: number;
      notes?: string;
    }>({
      query: ({ id, notes }) => ({
        url: `partner_rewards/${id}/mark_as_paid`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['PartnerReward'],
    }),

    cancelReward: builder.mutation<{ data: PartnerReward }, {
      id: number;
      reason?: string;
    }>({
      query: ({ id, reason }) => ({
        url: `partner_rewards/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['PartnerReward'],
    }),

    getRewardStatistics: builder.query<{ statistics: RewardStatistics }, {
      date_from?: string;
      date_to?: string;
    }>({
      query: (params) => ({
        url: 'partner_rewards/statistics',
        params,
      }),
      providesTags: ['PartnerReward'],
    }),

    exportRewards: builder.query<Blob, {
      status?: string;
      supplier_id?: number;
      date_from?: string;
      date_to?: string;
      format?: 'csv' | 'json';
    }>({
      query: (params) => ({
        url: 'partner_rewards/export',
        params: { ...params, format: params.format || 'csv' },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
  // Договоренности
  useGetAgreementsQuery,
  useGetAgreementQuery,
  useCreateAgreementMutation,
  useUpdateAgreementMutation,
  useDeleteAgreementMutation,
  useGetAvailableSuppliersQuery,
  
  // Правила
  useGetRulesQuery,
  useGetRuleQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  usePreviewRuleMutation,
  useGetRuleTypesQuery,
  
  // Вознаграждения
  useGetRewardsQuery,
  useGetRewardQuery,
  useUpdateRewardMutation,
  useMarkRewardAsPaidMutation,
  useCancelRewardMutation,
  useGetRewardStatisticsQuery,
  useLazyExportRewardsQuery,
} = partnerRewardsApi;