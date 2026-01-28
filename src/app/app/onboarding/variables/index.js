  // Client type options
  export const clientTypes = [
    { id: 'overheid', name: 'Overheid' },
    { id: 'privaat', name: 'Privaat' },
  ]

  // Contract Type options
  export const contractTypes = [
    { id: 'services', name: 'Services' },
    { id: 'works', name: 'Works' },
    { id: 'supplies', name: 'Supplies' },
  ]

  export const contractRangeLabels = ['€50k – €250k', '€250k – €1m', '€1m – €5m', '€5m+']

  export const valueBandLabels = ['€50k – €250k', '€250k – €1m', '€1m – €5m', '€5m+']

  // Primary Goal options
  export const primaryGoalOptions = [
    { id: 'bid_independently', name: 'Find relevant tenders to bid independently' },
    { id: 'joint_bids', name: 'Find partners for joint bids (consortia / combinations)' },
    { id: 'subcontractor', name: 'Participate as a subcontractor' },
    { id: 'both', name: 'Explore both tenders and partnership opportunities' }
  ]

  // Target Tenders options
  export const targetTendersOptions = [
    { id: 'national', name: 'National' },
    { id: 'european', name: 'European' },
    { id: 'both', name: 'Both' }
  ]

 
  export const MAX_PORTFOLIOS = 10