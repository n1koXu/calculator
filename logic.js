// 存储历史记录的数组
let calculationHistory = JSON.parse(localStorage.getItem('volumeCalculationHistory')) || [];
// 存储选中的记录ID
let selectedRecordIds = new Set();
// 分页相关变量
let currentPage = 1;
const recordsPerPage = 10; // 每页显示10条记录

// 获取DOM元素
const form = document.getElementById('volumeForm');
const calculateBtn = document.getElementById('calculateBtn');
const lengthInput = document.getElementById('length');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const quantityInput = document.getElementById('quantity');
const emptyState = document.getElementById('emptyState');
const resultState = document.getElementById('resultState');
const singleVolumeEl = document.getElementById('singleVolume');
const totalVolumeEl = document.getElementById('totalVolume');
const resetBtn = document.getElementById('resetBtn');
const historyList = document.getElementById('historyList');
const sumSelectedBtn = document.getElementById('sumSelectedBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const sumResult = document.getElementById('sumResult');
const sumValue = document.getElementById('sumValue');
const selectAllBtn = document.getElementById('selectAllBtn');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
// 分页控制元素
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentRangeEl = document.getElementById('currentRange');
const totalRecordsEl = document.getElementById('totalRecords');

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    updateHistoryButtons();
    updatePaginationControls();
    
    // 绑定全选按钮事件
    selectAllBtn.addEventListener('click', toggleSelectAll);
    selectAllCheckbox.addEventListener('change', toggleSelectAll);
    
    // 绑定分页按钮事件
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
});

// 计算体积的函数
function calculateVolume() {
    // 获取输入值
    const length = parseFloat(lengthInput.value);
    const width = parseFloat(widthInput.value);
    const height = parseFloat(heightInput.value);
    const quantity = parseInt(quantityInput.value);
    
    // 验证输入
    if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(quantity)) {
        alert('请输入有效的数值');
        return;
    }
    
    if (length <= 0 || width <= 0 || height <= 0 || quantity <= 0) {
        alert('请输入大于0的数值');
        return;
    }
    
    // 计算体积 (1立方米 = 1,000,000立方厘米)
    const singleVolume = (length * width * height) / 1000000;
    const totalVolume = singleVolume * quantity;
    
    // 显示结果
    emptyState.classList.add('hidden');
    resultState.classList.remove('hidden');
    
    // 格式化结果，保留3位小数
    singleVolumeEl.textContent = `${singleVolume.toFixed(3)} 立方米`;
    totalVolumeEl.textContent = `${totalVolume.toFixed(3)} 立方米`;
    
    // 启用重置按钮
    resetBtn.disabled = false;
    
    // 添加结果动画
    totalVolumeEl.classList.add('animate-pulse');
    setTimeout(() => {
        totalVolumeEl.classList.remove('animate-pulse');
    }, 1000);
    
    // 保存到历史记录
    saveToHistory(length, width, height, quantity, singleVolume, totalVolume);
}

// 保存计算结果到历史记录
function saveToHistory(length, width, height, quantity, singleVolume, totalVolume) {
    const now = new Date();
    const timestamp = now.toLocaleString(); // 格式化时间为本地字符串
    
    const record = {
        id: Date.now(), // 使用时间戳作为唯一ID
        length,
        width,
        height,
        quantity,
        singleVolume,
        totalVolume,
        timestamp
    };
    
    // 添加到历史记录数组的开头
    calculationHistory.unshift(record);
    
    // 限制历史记录数量为100条
    if (calculationHistory.length > 500) {
        calculationHistory = calculationHistory.slice(0, 500);
    }
    
    // 保存到localStorage
    localStorage.setItem('volumeCalculationHistory', JSON.stringify(calculationHistory));
    
    // 重置到第一页，显示最新记录
    currentPage = 1;
    // 清空选中状态
    selectedRecordIds.clear();
    
    // 更新历史记录显示
    renderHistory();
    updateHistoryButtons();
    updatePaginationControls();
}

// 获取当前页应该显示的记录
function getCurrentPageRecords() {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return calculationHistory.slice(startIndex, endIndex);
}

// 计算总页数
function getTotalPages() {
    return Math.ceil(calculationHistory.length / recordsPerPage);
}

// 渲染当前页的历史记录
function renderHistory() {
    // 清空现有记录
    historyList.innerHTML = '';
    
    // 如果没有记录，显示提示
    if (calculationHistory.length === 0) {
        historyList.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-8 text-center text-neutral">
                    暂无计算记录
                </td>
            </tr>
        `;
        return;
    }
    
    // 获取当前页的记录
    const currentRecords = getCurrentPageRecords();
    const totalPages = getTotalPages();
    
    // 显示当前页的记录，并计算正确的序号
    currentRecords.forEach((record, index) => {
        // 计算全局序号（考虑分页）
        const globalIndex = (currentPage - 1) * recordsPerPage + index;
        const sequenceNumber = globalIndex + 1;
        
        const row = document.createElement('tr');
        row.className = 'history-item-hover';
        row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap">
                <span class="text-neutral">${sequenceNumber}</span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <input type="checkbox" class="history-checkbox h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" data-id="${record.id}" ${selectedRecordIds.has(record.id) ? 'checked' : ''}>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                ${record.length}×${record.width}×${record.height}
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                ${record.quantity}
            </td>
            <td class="px-4 py-4 whitespace-nowrap font-medium">
                ${record.totalVolume.toFixed(3)}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-neutral">
                ${record.timestamp}
            </td>
        `;
        historyList.appendChild(row);
    });
    
    // 为新添加的复选框绑定事件
    document.querySelectorAll('.history-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const recordId = parseInt(this.getAttribute('data-id'));
            if (this.checked) {
                selectedRecordIds.add(recordId);
            } else {
                selectedRecordIds.delete(recordId);
            }
            updateHistoryButtons();
        });
    });
}

// 更新分页控件状态
function updatePaginationControls() {
    const totalRecords = calculationHistory.length;
    const totalPages = getTotalPages();
    
    // 更新记录计数显示
    totalRecordsEl.textContent = totalRecords;
    
    if (totalRecords === 0) {
        paginationControls.classList.add('hidden');
        return;
    }
    
    paginationControls.classList.remove('hidden');
    
    // 计算当前显示的记录范围
    const startRecord = (currentPage - 1) * recordsPerPage + 1;
    const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);
    currentRangeEl.textContent = `${startRecord}-${endRecord}`;
    
    // 更新分页按钮状态
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// 上一页
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderHistory();
        updatePaginationControls();
        updateHistoryButtons();
    }
}

// 下一页
function goToNextPage() {
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
        currentPage++;
        renderHistory();
        updatePaginationControls();
        updateHistoryButtons();
    }
}

// 更新历史记录相关按钮状态
function updateHistoryButtons() {
    // 检查是否有历史记录
    const hasHistory = calculationHistory.length > 0;
    clearHistoryBtn.disabled = !hasHistory;
    selectAllBtn.disabled = !hasHistory;
    selectAllCheckbox.disabled = !hasHistory;
    
    // 检查是否有选中的记录
    const hasSelected = selectedRecordIds.size > 0;
    
    sumSelectedBtn.disabled = !hasSelected;
    deleteSelectedBtn.disabled = !hasSelected;
    
    // 更新全选框状态
    if (hasHistory) {
        const allSelected = selectedRecordIds.size === calculationHistory.length;
        selectAllCheckbox.checked = allSelected;
    }
    
    // 如果没有选中项，隐藏求和结果
    if (!hasSelected) {
        sumResult.classList.add('hidden');
    }
}

// 全选/取消全选功能
function toggleSelectAll() {
    const isChecked = selectAllCheckbox.checked;
    
    if (isChecked) {
        // 全选所有记录
        calculationHistory.forEach(record => {
            selectedRecordIds.add(record.id);
        });
    } else {
        // 取消全选
        selectedRecordIds.clear();
    }
    
    // 重新渲染当前页以更新复选框状态
    renderHistory();
    updateHistoryButtons();
}

// 计算选中项的总和
function sumSelectedItems() {
    let total = 0;
    
    // 计算所有选中记录的总和
    calculationHistory.forEach(record => {
        if (selectedRecordIds.has(record.id)) {
            total += record.totalVolume;
        }
    });
    
    // 显示求和结果
    sumValue.textContent = `${total.toFixed(6)} 立方米`;
    sumResult.classList.remove('hidden');
    
    // 添加求和结果动画
    sumValue.classList.add('animate-pulse');
    setTimeout(() => {
        sumValue.classList.remove('animate-pulse');
    }, 1000);
}

// 删除选中的记录
function deleteSelectedItems() {
    if (selectedRecordIds.size === 0) {
        return;
    }
    
    if (confirm(`确定要删除选中的 ${selectedRecordIds.size} 条记录吗？`)) {
        // 过滤掉选中的记录
        calculationHistory = calculationHistory.filter(record => 
            !selectedRecordIds.has(record.id)
        );
        
        // 清空选中状态
        selectedRecordIds.clear();
        
        // 如果删除后当前页没有记录且不是第一页，则返回上一页
        const totalPages = getTotalPages();
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        // 更新localStorage
        localStorage.setItem('volumeCalculationHistory', JSON.stringify(calculationHistory));
        
        // 更新UI
        renderHistory();
        updateHistoryButtons();
        updatePaginationControls();
        sumResult.classList.add('hidden');
    }
}

// 清空所有历史记录
function clearHistory() {
    if (calculationHistory.length === 0) return;
    
    if (confirm('确定要清空所有历史记录吗？')) {
        calculationHistory = [];
        selectedRecordIds.clear();
        currentPage = 1; // 重置到第一页
        localStorage.removeItem('volumeCalculationHistory');
        renderHistory();
        updateHistoryButtons();
        updatePaginationControls();
        sumResult.classList.add('hidden');
    }
}

// 重置表单
function resetForm() {
    form.reset();
    emptyState.classList.remove('hidden');
    resultState.classList.add('hidden');
    resetBtn.disabled = true;
    
    // 添加重置动画
    form.classList.add('opacity-50');
    setTimeout(() => {
        form.classList.remove('opacity-50');
    }, 300);
}

// 事件监听
calculateBtn.addEventListener('click', calculateVolume);
resetBtn.addEventListener('click', resetForm);
sumSelectedBtn.addEventListener('click', sumSelectedItems);
clearHistoryBtn.addEventListener('click', clearHistory);
deleteSelectedBtn.addEventListener('click', deleteSelectedItems);

// 回车键触发计算
document.addEventListener('keydown', function(event) {
    // 检查是否按下的是回车键 (keyCode 13)
    if (event.keyCode === 13) {
        // 阻止表单默认提交行为
        event.preventDefault();
        
        // 触发计算按钮的点击事件
        calculateBtn.click();
    }
});

// 添加输入框获得焦点时的动画
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('scale-[1.02]');
        input.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('scale-[1.02]');
    });
});