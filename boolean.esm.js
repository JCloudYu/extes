Object.defineProperty(Boolean, 'batch_test', {
	value: function(...args) {
		return new _LogicalGroup(...args);
	},
	writable:true, configurable:true, enumerable:false
});

class _LogicalGroup {
	constructor(...initial_stages) {
		this._tests = [];
		this._result_cache = null;
		this.stage(...initial_stages);
	}
	
	stage(...test_stage) {
		const stage = [];
		for(const test of test_stage ) {
			if ( typeof test !== "function" ) continue;
			stage.push(test);
		}
		
		this._tests.push(stage);
		return this;
	}
	
	async calcAsync(shared_data={}) {
		if ( this._result_cache !== null ) {
			return this._result_cache;
		}
		
		
		let stage_result = true;
		for(const stage of this._tests) {
			for(const test of stage) {
				let result = await test(shared_data);
				result = (result === undefined) ? true : !!result;
				stage_result = stage_result && !!result;
			}
			this._result_cache = stage_result;
			if ( !stage_result ) break;
		}
		
		return stage_result;
	}
	
	calc(shared_data={}) {
		if ( this._result_cache !== null ) {
			return this._result_cache;
		}
		
		
		let stage_result = true;
		for(const stage of this._tests) {
			for(const test of stage) {
				let result = test(shared_data);
				result = (result === undefined) ? true : !!result;
				stage_result = stage_result && !!result;
			}
			this._result_cache = stage_result;
			if ( !stage_result ) break;
		}
		
		return stage_result;
	}
	
	[Symbol.toPrimitive] () {
		return this.calc();
	}
}
