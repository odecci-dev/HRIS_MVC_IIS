function initializeTimlogsDataTable() {
    var tableId = '#pending-timelogs-table';
    var lastSelectedRow = null;
    var img = "/image/emptypic.png";
    if ($.fn.DataTable.isDataTable(tableId)) {
        // Destroy the existing DataTable instance
        $(tableId).DataTable().clear().destroy();
    }
    var user = $('#selectUserPending').val() ? $('#selectUserPending').val() : 0;
    const data = {
        UserId: user
    };
    // console.log(data);
    var dtProperties = {
        ajax: {
            url: '/TimeLogs/GetPedingTimelogsList',
            type: "POST",
            data: {
                data: data
            },
            dataType: "json",
            processing: true,
            serverSide: true,
            complete: function (xhr) {
                var url = new URL(window.location.href);
                var _currentPage = url.searchParams.get("page01") == null ? 1 : url.searchParams.get("page01");
                // console.log('table1', _currentPage);
                table.page(_currentPage - 1).draw('page');

                // Compute total rendered hours after data is loaded
                //computeTotalRenderedHours();
            },
            error: function (err) {
                alert(err.responseText);
            }
        },
        columns: [
            {
                "title": "Profile",
                "data": "id",
                "render": function (data, type, row) {
                    var images = row['filePath'] == null ? img : row['filePath'];
                    //var images = img;
                    var fullname = row.fname + " " + row.lname;
                    var btn = `<div  style="display:flex; gap: 10px; align-items: center;">
                                            <div class="data-img">
                                                <img src='${images}' width="100%" />
                                            </div>
                                            <div style="align-items: center;">
                                                <h6 style="text-align: left; margin: 0; font-size: 16px;">${fullname}</h6>
                                                <p style="text-align: left; margin: 0; font-size: 12px;">${row.employeeID}</p>
                                            </div>
                                        </div>`;
                    return btn;
                }
            },
            // {
            //     "title": "Employee ID #",
            //     "data": "employeeID"
            // },
            //{
            //    "title": "Username",
            //    "data": "username"
            //},
            {
                "title": "Task",
                "data": "task"
            },
            {
                "title": "Task Decription",
                "data": "remarks"
            },
            {
                "title": "Time In",
                "data": "timeIn",
                "render": function (data, type, row) {
                    // var timeout = new Date(data).toLocaleTimeString('en-US');
                    var timein = new Date(data).toLocaleString('en-US');
                    timein = timein.replace(',', '').replaceAll('/', '-');
                    return timein;
                }
            },
            {
                "title": "Time Out",
                "data": "timeOut",
                "render": function (data, type, row) {
                    if (data == '') {
                        var noValue = "";
                        return noValue;
                    }
                    else {
                        // var timeout = new Date(data).toLocaleTimeString('en-US');
                        var timeout = new Date(data).toLocaleString('en-US');
                        timeout = timeout.replace(',', '').replaceAll('/', '-');
                        return timeout;
                    }

                }
            },
            {
                "title": "Total Rendered Hours",
                "data": "renderedHours"
            },
            {
                "title": "Date",
                "data": "date",
                "render": function (data) {
                    const parts = data.split(' ');
                    const part = parts[0].split('/');
                    //console.log(part);
                    if (part.length === 3) {
                        // Convert to `YYYY-MM-DD`
                        const formattedDate = `${part[1]}-${part[0]}-${part[2]}`;
                        return formattedDate;
                    }
                    return data;
                },
                type: "date" // Ensures proper sorting by date
            },
            {
                "title": "Status",
                "data": "statusName"
            },
            {
                "title": "Action",
                "data": "id",
                "render": function (data, type, row) {
                    var images = row['filePath'] == null ? img : row['filePath'];
                    var status = row.statusId;
                    var task = row.taskId;
                    var button = "";
                    if (row.statusId == '0') {
                        button = `<div class="action">
                                                    <button class="tbl-decline btn btn-danger" id="aprroved-timein" title="Delete"
                                                            data-id="${data}"
                                                            data-status="${row.statusId}"
                                                            data-task="${row.taskId}"
                                                            data-date="${row.date}"
                                                            data-timein="${row.timeIn}"
                                                            data-timeout="${row.timeOut}"
                                                            data-remarks="${row.remarks}"
                                                            data-userid="${row.userId}"
                                                        >
                                                        <i class="fa-solid fa-circle-xmark"></i> Decline
                                                    </button>
                                                    <button class="tbl-approve btn btn-success" id="add-timeout" title="Time Out"
                                                            data-id="${data}"
                                                            data-status="${row.statusId}"
                                                            data-task="${row.taskId}"
                                                            data-date="${row.date}"
                                                            data-timein="${row.timeIn}"
                                                            data-timeout="${row.timeOut}"
                                                            data-remarks="${row.remarks}"
                                                            data-userid="${row.userId}"
                                                        >
                                                        <i class="fa-solid fa-circle-check"></i> Approve
                                                    </button>
                                                </div>`;
                    }
                    return button;
                }
            }
        ]
        , responsive: true
        // , columnDefs:  columnDefsConfig
        , columnDefs: [
            { targets: 1, className: 'left-align' },
            { responsivePriority: 10010, targets: 6 },
            { responsivePriority: 10010, targets: 7 },
            { responsivePriority: 10010, targets: 8 },
            { responsivePriority: 10008, targets: 0 },
            { targets: 2, className: 'none' },
            { targets: 3, className: 'none' },
            { targets: 4, className: 'none' },
            { targets: 5, className: 'none' },
            { "type": "date", "targets": 0 },
            { width: '25%', targets: 0 },
            { width: '5%', targets: 8 }
        ],
        order: [[0, 'desc']] // Sort the second column (index 1) by descending order
    };

    var table = $(tableId).DataTable(dtProperties);

    // Attach computeTotalRenderedHours to the search event
    $(tableId + '_filter input').on('keyup', function () {
        computeTotalRenderedHours();
    });

    $('#time-table').on('page.dt', function () {
        var info = table.page.info();
        var url = new URL(window.location.href);
        url.searchParams.set('page01', (info.page + 1));
        window.history.replaceState(null, null, url);
    });

    $(tableId + '_filter input').attr('placeholder', 'Search anything here...');

    $(tableId + ' tbody').on('click', 'tr', function () {
        var data = table.row(this).data();
        // console.log(data);
        // Remove highlight from the previously selected row
        if (lastSelectedRow) {
            $(lastSelectedRow).removeClass('selected-row');
        }

        // Highlight the currently selected row
        $(this).addClass('selected-row');
        lastSelectedRow = this;
        // console.log(data);

    });
  
  
}

function timelogsTableMOD() {
    $('#selectUserPending').on('change', function () {

        initializeTimlogsDataTable();
    });
}
function initializeOTDataTable() {

    var tableId = '#pending-overtime-table';
    if ($.fn.DataTable.isDataTable(tableId)) {
        $(tableId).DataTable().clear().destroy();
    }
    var empNo = "0";
    empNo = document.getElementById('selectUserOTPending').value;
    empNo = empNo === '' ? '0' : empNo;
    let data = {
        EmployeeNo: empNo
    };
    //console.log(data);
    var dtProperties = {

        ajax: {
            url: '/OverTime/GetPendingOvertTimeList',
            type: "POST",
            data: {
                data: data
            },
            dataType: "json",
            processing: true,
            serverSide: true,
            complete: function (xhr) {
                var url = new URL(window.location.href);
                var _currentPage = url.searchParams.get("page01") == null ? 1 : url.searchParams.get("page01");
                //console.log('table1', _currentPage);
                table.page(_currentPage - 1).draw('page');
            },
            error: function (err) {
                alert(err.responseText);
            }
        },
        responsive: true,
        "columns": [

            {
                "title": "OT-Number",
                "data": "otNo", "orderable": false
            },

            {
                "title": "Date",
                "data": "date", "orderable": true
            },
            {
                "title": "Start Time",
                "data": "startTime", "orderable": false
            },
            {
                "title": "End Time",
                "data": "endTime", "orderable": false
            },
            {
                "title": "Start Date",
                "data": "startDate", "orderable": false
            },
            {
                "title": "End Date",
                "data": "endDate", "orderable": false
            },
            {
                "title": "Hours Filed",
                "data": "hoursFiled", "orderable": false
            },
            {
                "title": "Reason:",
                "data": "remarks", "orderable": false
            }
            ,
            {
                "title": "Convert To Leave",
                "data": "convertToLeave", "orderable": false,
                "render": function (data, type, row) {
                    result = "";
                    if (data == 0) {
                        result = "No";

                    } else if (data == 1) {
                        result = "Yes";
                    }
                    return result;
                }
            }
            ,
            {
                "title": "Status",
                "data": "statusName", "orderable": false
            },
            {
                "title": "Action",
                "data": "id",
                "render": function (data, type, row) {

                    var button = "";

                    button = `<div class="action">
                                    <button class="tbl-decline btn btn-danger" id="aprroved-timein" title="Delete"
                                            data-id="${data}"
                                            data-status="1005"
                                                            
                                        >
                                        <i class="fa-solid fa-circle-xmark"></i> Decline
                                    </button>
                                    <button class="tbl-approve btn btn-success" id="add-timeout" title="Time Out"
                                            data-id="${data}"
                                            data-status="5"             
                                        >
                                        <i class="fa-solid fa-circle-check"></i> Approve
                                    </button>
                                </div>`;
                    return button;
                }
            }
        ],
        columnDefs: [


            {
                targets: [0], // OT-Number column
                width: "20%"
            },
            {
                targets: [1], // Date column (only sortable column)
                type: 'date',
                width: "10%",
                render: function (data, type, row) {
                    if (data && (type === 'display' || type === 'filter')) {
                        let date = new Date(data);
                        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                    }
                    return data;
                }
            },
            {
                targets: [2, 3, 7], // Start Time, End Time
                orderable: false,
                className: 'none'
            },
            {
                targets: [4, 5], // Start Date, End Date
                orderable: false,
                className: 'none',
                render: function (data, type, row) {
                    if (data && (type === 'display' || type === 'filter')) {
                        let date = new Date(data);
                        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                    }
                    return data;
                }
            },
            {
                targets: [6], // Hours Filed, Hours Approved
                orderable: false,
                width: "10%"
            },
            {
                targets: [7], // Remarks column
                orderable: false,
                width: "10%"
            },
            {
                targets: [8], // Convert To Leave Column
                orderable: false,
                width: "10%"

            },
            {
                targets: [9], // Status Column
                orderable: false,
                width: "10%",
                createdCell: function (td, cellData, rowData, row, col) {
                    if (cellData === "APPROVED") {
                        $(td).css('color', 'green').css('font-weight', 'bold');
                    } else if (cellData === "PENDING") {
                        $(td).css('color', 'orange').css('font-weight', 'bold');
                    } else if (cellData === "Rejected") {
                        $(td).css('color', 'red').css('font-weight', 'bold');
                    }
                }
            },
            {
                targets: [10], // Convert To Leave Column
                orderable: false,
                width: "5%",

            },
        ]
    };

    $('#pending-overtime-table').on('page.dt', function () {

        var info = table.page.info();
        var url = new URL(window.location.href);
        url.searchParams.set('page01', (info.page + 1));
        window.history.replaceState(null, null, url);
    });

    var table = $(tableId).DataTable(dtProperties);
    $(tableId + '_filter input').attr('placeholder', 'Searching...');
    $(tableId + ' tbody').on('click', 'tr', function () {
        var data = table.row(this).data();

    });
}
function OTTableMOD() {
    $('#selectUserOTPending').on('change', function () {

        initializeOTDataTable();
    });
    $('#pending-overtime-table').on('click', '.tbl-decline', function () {
        var id = $(this).data('id');
        var status = $(this).data('status');

        localStorage.setItem('id', id);
        localStorage.setItem('status', status);
        //declinemodal();
        //$("#alertmodal").modal('show');
        OTdeclinemodal();
        $("#alertmodal").modal('show');
    });
    $('#pending-overtime-table').on('click', '.tbl-approve', function () {
        var id = $(this).data('id');
        var status = $(this).data('status');

        localStorage.setItem('id', id);
        localStorage.setItem('status', status);
        //approvemodal();
        OTapprovemodal();
        $("#alertmodal").modal('show');
    });

}
function OTapprovemodal() {
    var element = document.querySelectorAll(".modal-header");
    var content = document.querySelectorAll(".modal-content");
    var modal_span = document.querySelectorAll(".modal-header span");
    var delete_ = '<input type="submit" value="YES" id="btn-delete_item" class="btn-pay"  onclick="changeStatus_item()"/>';
    var cancelButton = '<input type="submit" value="NO" id="btn-cancel" class="btn-NO" data-dismiss="modal"/>';
    $('.input-container-button').empty();
    $('.img-header').empty();

    content.forEach(content => {
        content.style.setProperty("border-radius", "15px 15px 15px 15px", "important");
        content.style.setProperty("border-bottom", "7px #17a2b8 solid", "important");

    });
    modal_span.forEach(modal_span => {
        modal_span.style.setProperty("text-align", "center", "important");
        modal_span.style.setProperty("width", "100%", "important");
    });
    element.forEach(element => {
        element.style.setProperty("color", "white", "important");
        element.style.setProperty("background-color", "#17a2b8", "important");
        element.style.setProperty("border-radius", "15px 15px 0 0", "important");
        element.style.setProperty("text-align", "center", "important");
    });
    document.getElementById('message').textContent = 'Are you sure you want to aprroved this item?';
    document.getElementById('validation').textContent = 'Confirmation';
    $('.input-container-button').append(cancelButton);
    $('.input-container-button').append(delete_);
    $('.img-header').append('<img id="modalImage" src="/img/OPTION.webp" alt="Modal Image" />');
}
function OTdeclinemodal() {
    var element = document.querySelectorAll(".modal-header");
    var content = document.querySelectorAll(".modal-content");
    var modal_span = document.querySelectorAll(".modal-header span");
    var delete_ = '<input type="submit" value="YES" id="btn-delete_item" class="btn-pay"  onclick="changeStatus_item()"/>';
    var cancelButton = '<input type="submit" value="NO" id="btn-cancel" class="btn-NO" data-dismiss="modal"/>';
    $('.input-container-button').empty();
    $('.img-header').empty();

    content.forEach(content => {
        content.style.setProperty("border-radius", "15px 15px 15px 15px", "important");
        content.style.setProperty("border-bottom", "7px #d03a4b solid", "important");

    });
    modal_span.forEach(modal_span => {
        modal_span.style.setProperty("text-align", "center", "important");
        modal_span.style.setProperty("width", "100%", "important");
    });
    element.forEach(element => {
        element.style.setProperty("color", "white", "important");
        element.style.setProperty("background-color", "#d03a4b", "important");
        element.style.setProperty("border-radius", "15px 15px 0 0", "important");
        element.style.setProperty("text-align", "center", "important");
    });
    document.getElementById('message').textContent = 'Are you sure you want to aprroved this item?';
    document.getElementById('validation').textContent = 'Confirmation';
    $('.input-container-button').append(cancelButton);
    $('.input-container-button').append(delete_);
    $('.img-header').append('<img id="modalImage" src="/img/OPTION.webp" alt="Modal Image" />');
}
function changeStatus_item() {
    var id = localStorage.getItem('id');
    var status = localStorage.getItem('status');
    var data = {};
    data.id = id;
    data.status = status;


    $.ajax({
        url: '/OverTime/updateStatus',
        data: data,
        type: "POST",
        dataType: "json"
    }).done(function (data) {
        var status = data.status;
        console.log(status);
        if (status === 'Entity already exists') {
            notifyMsg('Warning!', 'OT already exists', 'yellow', 'fas fa-check');
        }
        else {
            notifyMsg('Success!', 'Successfully Saved', 'green', 'fas fa-check');
        }

        $("#alertmodal").modal('hide');
        initializeOTDataTable();
    });
}