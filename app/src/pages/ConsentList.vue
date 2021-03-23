<template>
  <q-page padding>
    <vuetable
      ref="vuetable"
      api-url="http://localhost:3000/consent"
      :fields="fields"
      data-path=""
      pagination-path=""
      :transform="transformData"
      :query-params="makeQueryParams"
    >
      <template
        slot="actions"
        scope="props"
      >
        <div class="table-button-container">
          <button
            class="btn btn-warning btn-sm"
            @click="editRow(props.rowData)"
          >
            <span class="glyphicon glyphicon-pencil"></span> Edit</button>&nbsp;&nbsp;
        </div>
      </template>
    </vuetable>
  </q-page>
</template>

<script>
import Vuetable from 'vuetable-2'
export default {
  // name: 'PageName',
  components: {
    Vuetable
  },
  methods: {
    transformData (data) {
      console.log("transformData")
      console.log(data)
      /*
      var transformed = {}

      transformed.pagination = {
        total: data.total,
        per_page: data.per_page,
        current_page: data.current_page,
        last_page: data.last_page,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
        from: data.from,
        to: data.to
      }

      transformed.mydata = []

      for (var i=0; i < data.length; i++) {
        transformed.mydata.push({
          id: data[i].id,
          fullname: data[i].name,
          email: data[i].email
        })
      }
      */
      return data
    },
    editRow (rowData) {
      alert("You clicked edit on" + JSON.stringify(rowData))
    },
    makeQueryParams (sortOrder, currentPage, perPage) {
      return {}
    }
  },
  data () {
    return {
      fields: [
        {
          name: "id",
          title: 'ID',
          width: "10%"
        },
        {
          name: "codicefiscale",
          title: 'Codice Fiscale',
          width: "20%"
        },
        {
          name: "ragistrationdate",
          title: 'Data di registrazione',
          width: "25%",
          formatter: (value) => {
            return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
            /*
            return value
            return (value === null)
              ? ''
              : moment(value, 'YYYY-MM-DD').format('MMM Do, YYYY')
              */
          }
        },
        {
          name: "actions",
          title: 'Actions',
          titleClass: "center aligned",
          dataClass: "center aligned",
          width: "15%",
        }
      ]
    }
  }
}
</script>
