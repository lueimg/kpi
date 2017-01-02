
module.exports = class Record {
  constructor(data = {}){
    this.legacy_id = '0';
    this.idrecord = data.idrecord || 0;

    this.weight = data.weight || undefined;
    this.document = data.document || '';
    this.document_type_id = data.document_type_id || '';
    this.reference = data.reference || ''; // It will be ignored when we are creating one by one
    this.status = data.status || 1; // 1: Created, 2 Deleted, 3 Asigned, 4 Discharge, 6 Closed
    this.origin = '2'; // 1: Uploded , 2: created manually

    // Ubigeo , only Clients nad Others have obigeo
    this.dpto = data.dpto || '';
    this.province = data.province || '';
    this.district = data.district || '';
    // @todo: save ubigeo code

    // User , CLient, Others: 1,2,3
    this.delivery_type_id = data.delivery_type_id || 0;
    /**
     * Destionation is 'Para' field
     * Depends of delivery_type_id
     */
    this.destination = '';
    this.dt_user_id = 0;
    this.dt_client_id = 0;
    /**
     * If delivery_type_id 'Usuario' 1
     * address will be office/area
     * If delivery_type_id 'Client' 2 or others
     * address will be direction
     */
    this.address = '';
    this.ubigeo_id = data.dt_others_ubigeo;

    if (data.delivery_type_id == 1) {
      if (data.deliveryUser && data.deliveryUser.value) {
        this.dt_user_id = data.deliveryUser.value.id;
        this.destination = `${data.deliveryUser.value.name} ${data.deliveryUser.value.last_name}`;
        this.address = `${data.deliveryUser.value.office_name} ${data.deliveryUser.value.area_name}`;
      }
    } else if (data.delivery_type_id == 2){
      if (data.deliveryClient && data.deliveryClient.value) {
        this.dt_client_id = data.deliveryClient.value.id;
        this.destination = `${data.deliveryClient.value.name}`;
        this.address = data.deliveryClient.value.address;
      }

    } else {
      this.destination = data.dt_others_para ||'';
      this.address = data.dt_others_address || '';
    }

    // Fields to be filled only on creation
    if (!data.idrecord) {
      this.date = data.date || new Date(); // creation date
      this.creationCode = data.creationCode || ''; // used when uploading
      this.origin = '2';
      this.sender = '';

      // Logged User
      this.user_id = data.user_id;
      this.created_at = data.created_at || new Date();
      this.created_by = data.user_id;
    } else {
      // Logged User
      this.updated_at = new Date();
      this.updated_by = data.user_id;
    }

    if (data.sender && data.sender.value) {
      let sender = data.sender.value;
      this.sender = `${sender.name} ${sender.last_name} - ${sender.office_name} ${sender.area_name}`;
      this.sender_id = sender.id;
    }

  }
};
